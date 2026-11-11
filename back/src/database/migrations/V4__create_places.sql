-- Lieux : un lieu regroupe plusieurs cadres (sa « flotte »).
-- Pas d'unicité sur le nom : l'identité d'un lieu, c'est son id (UUID).
CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Un cadre appartient obligatoirement à un lieu (place_id NOT NULL),
-- et un lieu qui contient des cadres ne peut pas être supprimé (ON DELETE RESTRICT).
-- SQLite ne sait pas ajouter une colonne NOT NULL + REFERENCES par ALTER TABLE :
-- on reconstruit la table. Elle ne contenait que des données de test, on repart à vide.
DROP TABLE IF EXISTS devices;

CREATE TABLE devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    mDNS TEXT NOT NULL,
    place_id TEXT NOT NULL REFERENCES places (id) ON DELETE RESTRICT
);

-- L'index unique sur mDNS (V3) a disparu avec l'ancienne table : on le recrée.
CREATE UNIQUE INDEX IF NOT EXISTS devices_mdns_unique ON devices (mDNS);
