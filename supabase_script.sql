-- Script SQL para agregar las nuevas columnas a la tabla 'usuarios' en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase

ALTER TABLE usuarios ADD COLUMN nombre TEXT;
ALTER TABLE usuarios ADD COLUMN apellido_paterno TEXT;
ALTER TABLE usuarios ADD COLUMN apellido_materno TEXT;
ALTER TABLE usuarios ADD COLUMN edad INTEGER;
ALTER TABLE usuarios ADD COLUMN pais TEXT;