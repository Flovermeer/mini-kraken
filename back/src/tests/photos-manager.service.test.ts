import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { PhotosManagerService } from '../services/photos-manager.service.js';
import { ImageNotStoredException } from '../exceptions/ImageNotStoredException.js';

const DEVICE_ID = '11111111-1111-1111-1111-111111111111';

/** Fabrique une image unie en mémoire : pas besoin de vraies photos dans le dépôt. */
function makeImage(width: number, height: number, format: 'jpeg' | 'png' = 'jpeg'): Promise<Buffer> {
    const image = sharp({ create: { width, height, channels: 3, background: { r: 255, g: 0, b: 0 } } });
    return format === 'png' ? image.png().toBuffer() : image.jpeg().toBuffer();
}

describe('PhotosManagerService', () => {
    let tmpDir: string;
    let service: PhotosManagerService;

    // Le service range tout sous process.cwd()/uploads : on fait croire au service que le dossier
    // courant est un dossier temporaire, pour ne jamais toucher au vrai uploads/ du back.
    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mini-kraken-photos-'));
        vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
        service = new PhotosManagerService();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    const photosDir = () => path.join(tmpDir, 'uploads', DEVICE_ID, 'photos');
    const thumbnailsDir = () => path.join(tmpDir, 'uploads', DEVICE_ID, 'thumbnails');

    describe('handleUploadedPhoto', () => {
        it('enregistre la photo en 800×480 et sa miniature en 200×200, sous le même nom', async () => {
            await service.handleUploadedPhoto(DEVICE_ID, await makeImage(1600, 1200));

            const photos = fs.readdirSync(photosDir());
            const thumbnails = fs.readdirSync(thumbnailsDir());
            expect(photos).toHaveLength(1);
            expect(thumbnails).toEqual(photos);

            const photo = await sharp(path.join(photosDir(), photos[0]!)).metadata();
            const thumbnail = await sharp(path.join(thumbnailsDir(), thumbnails[0]!)).metadata();
            expect([photo.width, photo.height]).toEqual([800, 480]);
            expect([thumbnail.width, thumbnail.height]).toEqual([200, 200]);
        });

        // Le contrat annonce du JPEG (image/jpeg, et le cadre attend un format unique).
        it('enregistre en JPEG, même quand on envoie un PNG', async () => {
            await service.handleUploadedPhoto(DEVICE_ID, await makeImage(1600, 1200, 'png'));

            const [file] = fs.readdirSync(photosDir());
            const photo = await sharp(path.join(photosDir(), file!)).metadata();
            expect(photo.format).toBe('jpeg');
        });

        it('redresse une photo prise en portrait (orientation EXIF) avant de la redimensionner', async () => {
            // Pixels stockés « couchés » (400×200) + étiquette EXIF « tourner de 90° » : c'est une photo portrait.
            const lyingPortrait = await sharp({ create: { width: 400, height: 200, channels: 3, background: { r: 255, g: 0, b: 0 } } })
                .jpeg()
                .withMetadata({ orientation: 6 })
                .toBuffer();

            await service.handleUploadedPhoto(DEVICE_ID, lyingPortrait);

            // Redressée, la photo est verticale : en "contain" dans 800×480, les bandes (noires) sont
            // sur les côtés. Non redressée, l'image remplirait toute la largeur.
            const [file] = fs.readdirSync(photosDir());
            const { data, info } = await sharp(path.join(photosDir(), file!)).raw().toBuffer({ resolveWithObject: true });
            const pixelAt = (x: number, y: number) => {
                const i = (y * info.width + x) * info.channels;
                return { r: data[i]!, g: data[i + 1]!, b: data[i + 2]! };
            };
            const left = pixelAt(10, 240);
            expect(left.r + left.g + left.b).toBeLessThan(30); // bande noire à gauche
            expect(pixelAt(400, 240).r).toBeGreaterThan(200); // la photo (rouge) au centre
        });

        it('lève une ImageNotStoredException et ne laisse aucun fichier si l\'image est illisible', async () => {
            await expect(service.handleUploadedPhoto(DEVICE_ID, Buffer.from('pas une image')))
                .rejects.toThrow(ImageNotStoredException);

            expect(fs.readdirSync(photosDir())).toEqual([]);
            expect(fs.readdirSync(thumbnailsDir())).toEqual([]);
        });
    });

    describe('getThumbnailsForDevice', () => {
        /** Crée des miniatures directement sur le disque, de la plus ancienne à la plus récente. */
        async function createThumbnails(count: number): Promise<string[]> {
            fs.mkdirSync(thumbnailsDir(), { recursive: true });
            const content = await makeImage(10, 10);
            const ids: string[] = [];
            for (let i = 0; i < count; i++) {
                const id = `photo-${String(i).padStart(2, '0')}`;
                const file = path.join(thumbnailsDir(), `${id}.jpeg`);
                fs.writeFileSync(file, content);
                // Dates de modification espacées d'une minute : l'ordre ne dépend pas de la vitesse du disque.
                const date = new Date(Date.UTC(2026, 0, 1, 0, i));
                fs.utimesSync(file, date, date);
                ids.push(id);
            }
            return ids;
        }

        it('renvoie une liste vide pour un cadre qui n\'a encore aucune photo', async () => {
            expect(await service.getThumbnailsForDevice(DEVICE_ID)).toEqual([]);
        });

        it('renvoie les miniatures de la plus récente à la plus ancienne, id sans extension et contenu en base64', async () => {
            await createThumbnails(3);

            const thumbnails = await service.getThumbnailsForDevice(DEVICE_ID);

            expect(thumbnails.map(t => t.id)).toEqual(['photo-02', 'photo-01', 'photo-00']);
            const onDisk = fs.readFileSync(path.join(thumbnailsDir(), 'photo-02.jpeg'));
            expect(Buffer.from(thumbnails[0]!.content, 'base64')).toEqual(onDisk);
        });

        it('pagine par 10 : la page 2 contient les plus anciennes', async () => {
            await createThumbnails(12);

            const page1 = await service.getThumbnailsForDevice(DEVICE_ID, 1);
            const page2 = await service.getThumbnailsForDevice(DEVICE_ID, 2);

            expect(page1).toHaveLength(10);
            expect(page2.map(t => t.id)).toEqual(['photo-01', 'photo-00']);
        });
    });
});
