import {Bonjour} from "bonjour-service";

const instance = new Bonjour();

instance.publish({
    name: "Cadre test",
    type: "minikraken",
    protocol: "tcp",
    port: 8080,
    txt: {
        id: "frame-0001"
    }
});


/**
 * {
 *   addresses: [
 *     '192.168.0.210',
 *     '172.21.208.1',
 *     '172.31.96.1',
 *     '2a02:2788:826:312d:d7cf:6a1b:7718:1654',
 *     '2a02:2788:826:312d:e7c2:eac0:2730:122f',
 *     '2a02:2788:826:312d:86d:d5f5:325:bd61',
 *     'fe80::901a:bf7c:e39c:f4ad',
 *     'fe80::dc68:a8fa:3501:c92b',
 *     'fe80::5e76:e14e:7e2d:cfcb'
 *   ],
 *   subtypes: [],
 *   ttl: 28800,
 *   lastSeen: 1793990689836,
 *   name: 'Cadre test',
 *   fqdn: 'Cadre test._minikraken._tcp.local',
 *   host: 'Kraken',
 *   referer: { address: '192.168.0.210', family: 'IPv4', port: 5353, size: 469 },
 *   port: 8080,
 *   type: 'minikraken',
 *   protocol: 'tcp',
 *   rawTxt: [ <Buffer 69 64 3d 66 72 61 6d 65 2d 30 30 30 31> ],
 *   txt: { id: 'frame-0001' }
 * }
 */