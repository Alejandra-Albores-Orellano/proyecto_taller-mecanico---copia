// js/app.js

const SYSTEM = {
    // 1. Definición de Permisos por Rol
    ROLES: {
        admin: { nombre: 'Jefe de Taller', access: ['all'], canDelete: true },
        recepcion: { nombre: 'Recepción', access: ['index', 'clientes', 'ordenes', 'inventario'], canDelete: false },
        mecanico: { nombre: 'Mecánico', access: ['index', 'ordenes', 'inventario'], canDelete: false, readOnlyForms: true }
    },

    // 2. Inicializar BD Simulada
    init: function() {
        if (!localStorage.getItem('sv_users')) {
            const users = [
                { user: 'admin', pass: '123', name: 'Ing. Trujillo', role: 'admin' },
                { user: 'abril', pass: '123', name: 'Abril Guzmán', role: 'recepcion' },
                { user: 'jose', pass: '123', name: 'José Herrera', role: 'mecanico' }
            ];
            localStorage.setItem('sv_users', JSON.stringify(users));
            
            // Datos dummy iniciales para ver la interfaz llena
            localStorage.setItem('sv_clientes', JSON.stringify([{ id:1, nombre:'Juan Perez', auto:'Nissan Versa', placa:'XYZ-123', tel:'9611234567' }]));
            localStorage.setItem('sv_ordenes', JSON.stringify([{ id:1001, cliente:'Juan Perez', auto:'Nissan Versa', falla:'Cambio de aceite', estado:'Pendiente' }]));
            localStorage.setItem('sv_inventario', JSON.stringify([{ sku:'ACE01', nombre:'Aceite 5W30', stock:20, min:5, precio:450 }]));
        }
    },

    // 3. Gestión de Sesión
    login: function(u, p) {
        const users = JSON.parse(localStorage.getItem('sv_users'));
        const found = users.find(usr => usr.user === u && usr.pass === p);
        if (found) {
            sessionStorage.setItem('sv_active', JSON.stringify(found));
            return true;
        }
        return false;
    },

    logout: function() {
        sessionStorage.removeItem('sv_active');
        window.location.href = 'login.html';
    },

    getActiveUser: function() {
        return JSON.parse(sessionStorage.getItem('sv_active'));
    },

    // 4. Seguridad y Renderizado de Interfaz
    checkSecurity: function() {
        this.init();
        const user = this.getActiveUser();
        const path = window.location.pathname;
        const page = path.split("/").pop() || 'index.html';

        // Si no hay usuario y no es login, fuera
        if (!user && !path.includes('login.html')) {
            window.location.href = 'login.html';
            return;
        }

        // Si hay usuario y es login, al index
        if (user && path.includes('login.html')) {
            window.location.href = 'index.html';
            return;
        }

        if (user) {
            const roleConfig = this.ROLES[user.role];

            // Restricción de acceso a páginas completas
            if (!roleConfig.access.includes('all') && !roleConfig.access.some(p => page.includes(p))) {
                alert('Acceso Denegado: No tienes permisos para esta sección.');
                window.location.href = 'index.html';
                return;
            }

            this.renderSidebar(user);
            this.applyUIRestrictions(user);
        }
    },

    // Renderiza menú según permisos
    renderSidebar: function(user) {
        const el = document.getElementById('sidebar');
        if (!el) return;

        const roleName = this.ROLES[user.role].nombre;
        const access = this.ROLES[user.role].access;
        const isAdmin = user.role === 'admin';

        let html = `
            <div class="brand">ServiTaller</div>
            <div class="user-panel">
                <strong>${user.name}</strong><br>
                <small>${roleName}</small>
            </div>
            <nav>
                <a href="index.html" class="${window.location.href.includes('index')?'active':''}">📊 Dashboard</a>`;

        if (isAdmin || access.includes('clientes')) 
            html += `<a href="clientes.html" class="${window.location.href.includes('clientes')?'active':''}">👥 Clientes</a>`;
        
        if (isAdmin || access.includes('ordenes')) 
            html += `<a href="ordenes.html" class="${window.location.href.includes('ordenes')?'active':''}">🔧 Órdenes</a>`;
        
        if (isAdmin || access.includes('inventario')) 
            html += `<a href="inventario.html" class="${window.location.href.includes('inventario')?'active':''}">📦 Inventario</a>`;
        
        if (isAdmin) {
            html += `<a href="reportes.html" class="${window.location.href.includes('reportes')?'active':''}">📈 Reportes</a>`;
            html += `<a href="usuarios.html" class="${window.location.href.includes('usuarios')?'active':''}">🔐 Usuarios</a>`;
        }

        html += `<a href="#" onclick="SYSTEM.logout()" class="logout">🚪 Salir</a></nav>`;
        el.innerHTML = html;
    },

    // Oculta botones según reglas de negocio
    applyUIRestrictions: function(user) {
        const roleConfig = this.ROLES[user.role];

        // 1. Si no puede borrar, ocultar botones ".btn-delete"
        if (!roleConfig.canDelete) {
            document.querySelectorAll('.btn-delete').forEach(btn => btn.style.display = 'none');
        }

        // 2. Si es Mecánico (solo lectura de formularios), ocultar formularios de creación
        if (roleConfig.readOnlyForms) {
            document.querySelectorAll('.form-creation-container').forEach(div => div.style.display = 'none');
        }
    }
};