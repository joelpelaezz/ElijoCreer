-- Script para setear admin role
-- Ejecutar en SQL Editor de Supabase Dashboard

UPDATE profiles 
SET role = 'admin' 
WHERE email = 'joelpelaezz@gmail.com' 
AND (role IS NULL OR role != 'admin');

-- Verificar el resultado
SELECT id, email, role 
FROM profiles 
WHERE email = 'joelpelaezz@gmail.com';