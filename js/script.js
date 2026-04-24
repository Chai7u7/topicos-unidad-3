// CONFIGURACIÓN DE TU PROYECTO
const SUPABASE_URL = 'https://nwbaprbezbrljmdmrqui.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53YmFwcmJlemJybGptZG1ycXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjE4NjAsImV4cCI6MjA5MjQzNzg2MH0.LhDh2H1v0CMqZP1du3ixltkrEIwM3pmfKYIluF6m9YY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Crear usuario admin de prueba si no existe, para poder usar la inyección admin' --
async function ensureAdminUser() {
    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('email')
        .eq('email', 'admin');

    if (error) {
        console.log('No se pudo verificar admin:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        await supabaseClient.from('usuarios').insert([{ 
            nombre: 'Admin',
            apellido_paterno: 'Demo',
            apellido_materno: 'User',
            edad: 0,
            pais: 'Local',
            email: 'admin',
            password: 'admin123'
        }]);
        console.log('Usuario admin creado para prueba de inyección.');
    }
}

ensureAdminUser();

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
    const emailInput = document.getElementById('login-email').value;
    const passInput = document.getElementById('login-password').value;

    // Obtener todos los usuarios
    const { data: allUsers, error: fetchError } = await supabaseClient
        .from('usuarios')
        .select('*');

    if (fetchError) {
        alert("Error al conectar: " + fetchError.message);
        return;
    }

    // VULNERABLE: Construcción de condición SQL sin sanitizar
    // Simula SQL: WHERE email = 'emailInput' AND password = 'passInput'
    let sqlQuery = `email='${emailInput}' AND password='${passInput}'`;

    // Ajuste para la inyección clásica de OR sin necesidad de comentar manualmente
    if (/\sOR\s/i.test(sqlQuery) && !/--/.test(sqlQuery)) {
        sqlQuery = sqlQuery.replace(/(\sOR\s.*)\sAND\spassword=.*$/i, '$1 --');
    }
    
    console.log("SQL Query (VULNERABLE):", "SELECT * FROM usuarios WHERE " + sqlQuery);

    // Función vulnerable que evalúa la condición SQL
    function checkSQLCondition(user, sqlCondition) {
        // Reemplazar los placeholders con los valores reales del usuario
        let condition = sqlCondition
            .replace(/email/g, `'${user.email}'`)
            .replace(/password/g, `'${user.password}'`);
        
        // Convertir operadores SQL a JavaScript
        condition = condition
            .replace(/ AND /gi, ' && ')
            .replace(/ OR /gi, ' || ')
            .replace(/=/g, '==')
            .split('--')[0]; // Eliminar comentarios SQL
        
        console.log("Evaluating condition:", condition);
        
        try {
            // VULNERABLE: Evalúa la condición inyectada
            return eval(condition);
        } catch (e) {
            console.log("Error en evaluación:", e.message);
            return false;
        }
    }

    // Buscar primer usuario que cumpla la condición
    let userFound = null;
    for (let user of allUsers) {
        if (checkSQLCondition(user, sqlQuery)) {
            userFound = user;
            break;
        }
    }

    if (!userFound) {
        alert("Acceso denegado: Correo o contraseña incorrectos");
    } else {
        const panel = document.getElementById('user-panel');
        const loginBox = document.getElementById('login-box');
        const registerBox = document.getElementById('register-box');
        const userWelcome = document.getElementById('user-welcome');

        loginBox.classList.add('hidden');
        registerBox.classList.add('hidden');
        panel.classList.remove('hidden');
        userWelcome.textContent = `Bienvenido, ${userFound.nombre} ${userFound.apellido_paterno} ${userFound.apellido_materno} (${userFound.email})`;

        console.log("Usuario autenticado:", userFound);
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