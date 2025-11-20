const APP = {
    ROLES: {
        ADMIN: { id: 'admin', nombre: 'Jefe Taller', accessLevel: 3 },
        RECEPCION: { id: 'recepcion', nombre: 'Recepción', accessLevel: 2 },
        MECANICO: { id: 'mecanico', nombre: 'Mecánico', accessLevel: 1 }
    },

    // --- INICIALIZACIÓN DE DATOS (SEED) ---
    initDB: function() {
        if(!localStorage.getItem('st_users')) {
            const users = [
                { user: 'admin', pass: '123', nombre: 'Ing. Trujillo', role: 'admin' },
                { user: 'recepcion', pass: '123', nombre: 'Abril Guzmán', role: 'recepcion' },
                { user: 'mecanico', pass: '123', nombre: 'José Herrera', role: 'mecanico' }
            ];
            localStorage.setItem('st_users', JSON.stringify(users));
        }
        if(!localStorage.getItem('st_clients')) localStorage.setItem('st_clients', JSON.stringify([]));
        if(!localStorage.getItem('st_orders')) localStorage.setItem('st_orders', JSON.stringify([]));
        if(!localStorage.getItem('st_inventory')) {
            localStorage.setItem('st_inventory', JSON.stringify([
                { id: 1, sku: 'ACE-001', nombre: 'Aceite 5W-30', precio: 450, stock: 10, min: 5 },
                { id: 2, sku: 'FIL-002', nombre: 'Filtro Aire', precio: 150, stock: 2, min: 5 }
            ]));
        }
    },

    // --- AUTENTICACIÓN Y SEGURIDAD ---
    getSession: () => JSON.parse(sessionStorage.getItem('st_session')),
    
    checkAuth: function() {
        this.initDB();
        const session = this.getSession();
        if(!session && !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
        if(session) this.renderSidebar(session);
    },

    login: function(u, p) {
        const users = JSON.parse(localStorage.getItem('st_users'));
        const found = users.find(user => user.user === u && user.pass === p);
        if(found) {
            sessionStorage.setItem('st_session', JSON.stringify(found));
            return true;
        }
        return false;
    },

    logout: function() {
        sessionStorage.removeItem('st_session');
        window.location.href = 'login.html';
    },

    // --- UI HELPERS ---
    renderSidebar: function(user) {
        const sidebar = document.getElementById('sidebar');
        if(!sidebar) return;
        
        const roleLabel = this.ROLES[user.role.toUpperCase()].nombre;
        
        // Lógica de Menú según Rol
        let menu = `<a href="index.html">📊 Dashboard</a>`;
        
        if(user.role !== 'mecanico') {
            menu += `<a href="clientes.html">👥 Clientes</a>`;
        }
        
        menu += `<a href="ordenes.html">🔧 Órdenes</a>`;
        menu += `<a href="inventario.html">📦 Inventario</a>`;
        
        if(user.role === 'admin') {
            menu += `<a href="reportes.html">📈 Reportes</a>`;
            menu += `<a href="pruebas.html" style="color:#f1c40f">🧪 Pruebas (QA)</a>`;
        }

        sidebar.innerHTML = `
            <div class="brand">ServiTaller</div>
            <div class="user-info">
                <strong>${user.nombre}</strong><br><small>${roleLabel}</small>
            </div>
            <nav>${menu}</nav>
            <nav><a href="#" onclick="APP.logout()" style="color:var(--danger)">🚪 Salir</a></nav>
        `;
    },

    // --- MÓDULOS CRUD (Data Access Object Pattern) ---
    DAO: {
        // CLIENTES (Create, Read, Delete)
        createClient: (data) => {
            const db = JSON.parse(localStorage.getItem('st_clients')) || [];
            data.id = Date.now();
            db.push(data);
            localStorage.setItem('st_clients', JSON.stringify(db));
            return data;
        },
        getClients: () => JSON.parse(localStorage.getItem('st_clients')) || [],
        deleteClient: (id) => {
            let db = JSON.parse(localStorage.getItem('st_clients'));
            db = db.filter(c => c.id !== id);
            localStorage.setItem('st_clients', JSON.stringify(db));
        },

        // ORDENES (Create, Update, Read, Delete)
        createOrder: (data) => {
            const db = JSON.parse(localStorage.getItem('st_orders')) || [];
            data.id = Date.now(); // ID único
            data.status = 'Pendiente';
            data.workNotes = ''; // Notas del mecánico
            db.push(data);
            localStorage.setItem('st_orders', JSON.stringify(db));
            return data;
        },
        getOrders: () => JSON.parse(localStorage.getItem('st_orders')) || [],
        updateOrder: (id, updates) => {
            const db = JSON.parse(localStorage.getItem('st_orders'));
            const idx = db.findIndex(o => o.id === id);
            if(idx !== -1) {
                db[idx] = { ...db[idx], ...updates }; // Merge updates
                localStorage.setItem('st_orders', JSON.stringify(db));
                return true;
            }
            return false;
        },
        deleteOrder: (id) => {
            let db = JSON.parse(localStorage.getItem('st_orders'));
            db = db.filter(o => o.id !== id);
            localStorage.setItem('st_orders', JSON.stringify(db));
        },

        // INVENTARIO
        createProduct: (data) => {
            const db = JSON.parse(localStorage.getItem('st_inventory')) || [];
            data.id = Date.now();
            db.push(data);
            localStorage.setItem('st_inventory', JSON.stringify(db));
        },
        getInventory: () => JSON.parse(localStorage.getItem('st_inventory')) || [],
        deleteProduct: (id) => {
            let db = JSON.parse(localStorage.getItem('st_inventory'));
            db = db.filter(p => p.id !== id);
            localStorage.setItem('st_inventory', JSON.stringify(db));
        }
    }
};