-- Un cadre (identifié par son id matériel annoncé en mDNS) ne peut être appairé qu'une seule fois.
-- SQLite ne permet pas d'ajouter une contrainte à une table existante (pas de ALTER TABLE ... ADD CONSTRAINT) :
-- un index unique a exactement le même effet, la base refuse tout doublon.
CREATE UNIQUE INDEX IF NOT EXISTS devices_mdns_unique ON devices (mDNS);
