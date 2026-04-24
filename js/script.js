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
    const nombre = document.getElementById('reg-nombre').value;
    const apellidoPaterno = document.getElementById('reg-apellido-paterno').value;
    const apellidoMaterno = document.getElementById('reg-apellido-materno').value;
    const edad = document.getElementById('reg-edad').value;
    const pais = document.getElementById('reg-pais').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;

    const { data, error } = await supabaseClient
        .from('usuarios')
        .insert([{ 
            nombre: nombre, 
            apellido_paterno: apellidoPaterno, 
            apellido_materno: apellidoMaterno, 
            edad: edad, 
            pais: pais, 
            email: email, 
            password: pass 
        }]); // Se guarda tal cual (texto plano)

    if (error) {
        alert("Error al registrar: " + error.message);
    } else {
        alert("Usuario guardado en la tabla (Sin cifrar)");
        toggleForm();
    }
}

// Función para LOGIN (Consultar la tabla) - VULNERABLE A INYECCIÓN SQL
async function login() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    // VULNERABLE: Construye la consulta sin sanitizar, permite inyección OR
    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('*')
        .or(`email.eq.${email},password.eq.${pass}`);  // Permite inyección de OR

    if (error || !data || data.length === 0) {
        alert("Acceso denegado: Correo o contraseña incorrectos");
    } else {
        // Si hay múltiples resultados por la inyección, tomar el primero
        const user = Array.isArray(data) ? data[0] : data;
        
        const panel = document.getElementById('user-panel');
        const loginBox = document.getElementById('login-box');
        const registerBox = document.getElementById('register-box');
        const userWelcome = document.getElementById('user-welcome');

        loginBox.classList.add('hidden');
        registerBox.classList.add('hidden');
        panel.classList.remove('hidden');
        userWelcome.textContent = `Bienvenido, ${user.nombre} ${user.apellido_paterno} ${user.apellido_materno} (${user.email})`;

        console.log("Datos encontrados:", user);
    }
}

function logout() {
    document.getElementById('login-box').classList.remove('hidden');
    document.getElementById('user-panel').classList.add('hidden');
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    // Limpiar campos de registro
    document.getElementById('reg-nombre').value = '';
    document.getElementById('reg-apellido-paterno').value = '';
    document.getElementById('reg-apellido-materno').value = '';
    document.getElementById('reg-edad').value = '';
    document.getElementById('reg-pais').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-password').value = '';
}