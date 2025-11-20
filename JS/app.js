// js/app.js

const APP = {
    // Configuración de Roles
    ROLES: {
        ADMIN: { id: 1, nombre: 'Administrador', perm: 'all' },
        RECEPCION: { id: 2, nombre: 'Recepción', perm: 'create_orders' },
        MECANICO: { id: 3, nombre: 'Mecánico', perm: 'execute_orders' }
    },

    // --- 1. INICIALIZACIÓN ---
    initDB: function() {
        if(!localStorage.getItem('st_init')) {
            const usuarios = [
                { id: 1, user: 'admin', pass: '123', nombre: 'Ing. Trujillo', rol: 1 },
                { id: 2, user: 'recepcion', pass: '123', nombre: 'Abril Guzmán', rol: 2 },
                { id: 3, user: 'mecanico', pass: '123', nombre: 'José Herrera', rol: 3 }
            ];
            localStorage.setItem('st_usuarios', JSON.stringify(usuarios));
            localStorage.setItem('st_clientes', JSON.stringify([]));
            localStorage.setItem('st_vehiculos', JSON.stringify([]));
            localStorage.setItem('st_ordenes', JSON.stringify([])); 
            localStorage.setItem('st_asignaciones', JSON.stringify([])); 
            localStorage.setItem('st_refacciones', JSON.stringify([
                { id: 1, sku: 'ACE-01', nombre: 'Aceite Sintético', stock: 20, min: 5, precio: 450 },
                { id: 2, sku: 'FIL-01', nombre: 'Filtro Aire', stock: 3, min: 5, precio: 150 }
            ]));
            localStorage.setItem('st_init', 'true');
        }
    },

    // --- 2. AUTENTICACIÓN ---
    getSession: () => JSON.parse(sessionStorage.getItem('st_session')),
    
    checkAuth: function() {
        this.initDB();
        const s = this.getSession();
        if(!s && !location.pathname.includes('login.html')) location.href = 'login.html';
        if(s) this.renderSidebar(s);
    },

    login: function(u, p) {
        const users = JSON.parse(localStorage.getItem('st_usuarios'));
        const user = users.find(x => x.user === u && x.pass === p);
        if(user) {
            sessionStorage.setItem('st_session', JSON.stringify(user));
            return true;
        }
        return false;
    },

    logout: function() {
        sessionStorage.removeItem('st_session');
        location.href = 'login.html';
    },

    // --- 3. INTERFAZ DE USUARIO (UI) ---
    renderSidebar: function(user) {
        const sb = document.getElementById('sidebar');
        if(!sb) return;
        
        const rolName = Object.values(this.ROLES).find(r => r.id === user.rol).nombre;
        
        let menu = `<a href="index.html">📊 Dashboard</a>`;
        if(user.rol !== 3) menu += `<a href="clientes.html">👥 Clientes</a>`; 
        menu += `<a href="ordenes.html">🔧 Órdenes</a>`;
        menu += `<a href="inventario.html">📦 Inventario</a>`;
        
        // Enlaces de Admin
        if(user.rol === 1) {
            menu += `<a href="reportes.html">📈 Reportes</a>`;
            menu += `<a href="usuarios.html" style="color:#3498db">🔐 Usuarios</a>`;
            menu += `<a href="pruebas.html" style="color:#f1c40f">🧪 Pruebas QA</a>`;
        }

        sb.innerHTML = `
            <div class="brand">ServiTaller</div>
            <div class="user-info">
                <strong>${user.nombre}</strong><br><small>${rolName}</small>
            </div>
            <nav>${menu}</nav>
            <nav style="margin-top:auto"><a href="#" onclick="APP.logout()" style="color:#e74c3c">🚪 Cerrar Sesión</a></nav>
        `;
    },

    // --- 4. DAO (Data Access Object) - CRUD COMPLETO ---
    DAO: {
        // USUARIOS
        getUsers: () => JSON.parse(localStorage.getItem('st_usuarios')),
        createUser: (data) => {
            let db = JSON.parse(localStorage.getItem('st_usuarios'));
            if(db.find(u => u.user === data.user)) return { success: false, msg: 'Usuario duplicado.' };
            data.id = Date.now();
            db.push(data);
            localStorage.setItem('st_usuarios', JSON.stringify(db));
            return { success: true, msg: 'Usuario creado.' };
        },
        deleteUser: (id) => {
            let db = JSON.parse(localStorage.getItem('st_usuarios'));
            if(id === APP.getSession().id) return { success: false, msg: 'No puedes borrarte a ti mismo.' };
            const newDb = db.filter(u => u.id !== id);
            localStorage.setItem('st_usuarios', JSON.stringify(newDb));
            return { success: true, msg: 'Usuario eliminado.' };
        },

        // CLIENTES (Y VEHÍCULOS ASOCIADOS)
        createClient: (data) => {
            const db = JSON.parse(localStorage.getItem('st_clientes'));
            data.id = Date.now();
            db.push(data);
            localStorage.setItem('st_clientes', JSON.stringify(db));
            return data;
        },
        getClients: () => JSON.parse(localStorage.getItem('st_clientes')),
        deleteClient: (id) => {
            // Borrar cliente
            let dbCli = JSON.parse(localStorage.getItem('st_clientes'));
            dbCli = dbCli.filter(c => c.id !== id);
            localStorage.setItem('st_clientes', JSON.stringify(dbCli));
            
            // Borrar vehículos asociados (Integridad Referencial simulada)
            let dbVeh = JSON.parse(localStorage.getItem('st_vehiculos'));
            dbVeh = dbVeh.filter(v => v.idCliente !== id);
            localStorage.setItem('st_vehiculos', JSON.stringify(dbVeh));
            return true;
        },

        // VEHÍCULOS
        createVehicle: (data) => {
            const db = JSON.parse(localStorage.getItem('st_vehiculos'));
            data.id = Date.now() + 1;
            db.push(data);
            localStorage.setItem('st_vehiculos', JSON.stringify(db));
            return data;
        },
        getVehicles: () => JSON.parse(localStorage.getItem('st_vehiculos')),

        // ÓRDENES
        createOrder: (data) => {
            const db = JSON.parse(localStorage.getItem('st_ordenes'));
            const order = {
                id: Date.now(),
                idVehiculo: data.idVehiculo,
                idEstado: 'Pendiente', 
                falla: data.falla,
                fecha: new Date().toISOString().split('T')[0],
                monto: 0
            };
            db.push(order);
            localStorage.setItem('st_ordenes', JSON.stringify(db));
            
            const asigs = JSON.parse(localStorage.getItem('st_asignaciones'));
            asigs.push({ idOrden: order.id, idMecanico: null, observaciones: '' });
            localStorage.setItem('st_asignaciones', JSON.stringify(asigs));
            return order;
        },
        getOrders: () => {
            const orders = JSON.parse(localStorage.getItem('st_ordenes'));
            const asigs = JSON.parse(localStorage.getItem('st_asignaciones'));
            return orders.map(o => {
                const a = asigs.find(x => x.idOrden === o.id) || {};
                return { ...o, observacionesMecanico: a.observaciones };
            });
        },
        updateOrderMechanic: (idOrden, obs, nuevoEstado) => {
            const orders = JSON.parse(localStorage.getItem('st_ordenes'));
            const idxO = orders.findIndex(o => o.id === idOrden);
            if(idxO > -1) {
                orders[idxO].idEstado = nuevoEstado;
                localStorage.setItem('st_ordenes', JSON.stringify(orders));
            }
            const asigs = JSON.parse(localStorage.getItem('st_asignaciones'));
            const idxA = asigs.findIndex(a => a.idOrden === idOrden);
            if(idxA > -1) {
                asigs[idxA].observaciones = obs;
                localStorage.setItem('st_asignaciones', JSON.stringify(asigs));
                return true;
            }
            return false;
        },
        deleteOrder: (id) => {
            let db = JSON.parse(localStorage.getItem('st_ordenes'));
            db = db.filter(o => o.id !== id);
            localStorage.setItem('st_ordenes', JSON.stringify(db));
            return true;
        },

        // INVENTARIO (REFACCIONES)
        getInventory: () => JSON.parse(localStorage.getItem('st_refacciones')),
        createProduct: (p) => {
            let db = JSON.parse(localStorage.getItem('st_refacciones')) || [];
            const index = db.findIndex(item => item.sku === p.sku);
            if (index !== -1) {
                db[index].stock = parseInt(db[index].stock) + parseInt(p.stock);
                db[index].nombre = p.nombre;
                db[index].precio = p.precio;
                db[index].min = p.min;
                localStorage.setItem('st_refacciones', JSON.stringify(db));
                return { status: 'updated', data: db[index] };
            } else {
                p.id = Date.now();
                db.push(p);
                localStorage.setItem('st_refacciones', JSON.stringify(db));
                return { status: 'created', data: p };
            }
        },
        deleteProduct: (id) => {
            let db = JSON.parse(localStorage.getItem('st_refacciones'));
            db = db.filter(p => p.id !== id);
            localStorage.setItem('st_refacciones', JSON.stringify(db));
            return true;
        }
    }
};