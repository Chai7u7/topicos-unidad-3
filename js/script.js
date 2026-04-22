// CONFIGURACIÓN DE TU PROYECTO
const SUPABASE_URL = 'https://nwbaprbezbrljmdmrqui.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53YmFwcmJlemJybGptZG1ycXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjE4NjAsImV4cCI6MjA5MjQzNzg2MH0.LhDh2H1v0CMqZP1du3ixltkrEIwM3pmfKYIluF6m9YY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Alternar entre Login y Registro
function toggleForm() {
    document.getElementById('login-box').classList.toggle('hidden');
    document.getElementById('register-box').classList.toggle('hidden');
}

// Función para REGISTRAR (Insertar en tabla)
async function registrar() {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;

    const { data, error } = await supabaseClient
        .from('usuarios')
        .insert([{ email: email, password: pass }]); // Se guarda tal cual (texto plano)

    if (error) {
        alert("Error al registrar: " + error.message);
    } else {
        alert("Usuario guardado en la tabla (Sin cifrar)");
        toggleForm();
    }
}

// Función para LOGIN (Consultar la tabla)
async function login() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    const { data, error } = await supabaseClient
        .from('usuarios_clase')
        .select('*')
        .eq('email', email)
        .eq('password', pass) // Compara texto directo
        .single();

    if (error || !data) {
        alert("Acceso denegado: Correo o contraseña incorrectos");
    } else {
        alert("¡Bienvenido! Has iniciado sesión con éxito.");
        console.log("Datos encontrados:", data);
    }
}