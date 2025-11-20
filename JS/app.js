const APP = {
    ROLES: {
        ADMIN: { id: 1, nombre: 'Administrador' },
        RECEPCION: { id: 2, nombre: 'Recepción' },
        MECANICO: { id: 3, nombre: 'Mecánico' }
    },

    initDB: function() {
        if(!localStorage.getItem('st_init_v2')) {
            this.resetDB();
        }
    },

    resetDB: function() {
        const usuarios = [
            { id: 1, user: 'admin', pass: '123', nombre: 'Ing. Trujillo', rol: 1 },
            { id: 2, user: 'recepcion', pass: '123', nombre: 'Abril Guzmán', rol: 2 },
            { id: 3, user: 'mecanico', pass: '123', nombre: 'José Herrera', rol: 3 }
        ];
        
        localStorage.clear();
        
        // Tablas Estructurales
        localStorage.setItem('st_usuarios', JSON.stringify(usuarios));
        localStorage.setItem('st_clientes', JSON.stringify([]));
        localStorage.setItem('st_vehiculos', JSON.stringify([]));
        
        // Tablas Operativas (Relaciones 1:1 y 1:N)
        localStorage.setItem('st_ordenes', JSON.stringify([]));
        localStorage.setItem('st_recepciones', JSON.stringify([]));
        localStorage.setItem('st_obs_int', JSON.stringify([])); // Observaciones Interiores
        localStorage.setItem('st_obs_ext', JSON.stringify([])); // Observaciones Exteriores
        localStorage.setItem('st_asignaciones', JSON.stringify([])); // Bitácora mecánico
        localStorage.setItem('st_control_calidad', JSON.stringify([])); // QA
        
        // Inventario
        localStorage.setItem('st_proveedores', JSON.stringify([{id:1, nombre:'Refaccionaria Central', tel:'555-0000'}]));
        localStorage.setItem('st_refacciones', JSON.stringify([
            { id: 1, sku: 'ACE-01', nombre: 'Aceite Sintético', stock: 20, min: 5, precio: 450, idProv: 1 }
        ]));
        
        localStorage.setItem('st_init_v2', 'true');
    },

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

    renderSidebar: function(user) {
        const sb = document.getElementById('sidebar');
        if(!sb) return;
        const rolName = Object.values(this.ROLES).find(r => r.id === user.rol).nombre;
        
        let menu = `<a href="index.html">📊 Dashboard</a>`;
        if(user.rol !== 3) menu += `<a href="clientes.html">👥 Clientes</a>`;
        menu += `<a href="ordenes.html">🔧 Órdenes</a>`;
        menu += `<a href="inventario.html">📦 Inventario</a>`;
        
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

    DAO: {
        getNextId: (list) => list.length === 0 ? 1 : Math.max(...list.map(i => i.id)) + 1,

        // --- MÓDULO CLIENTES ---
        createClient: (d) => {
            let db = JSON.parse(localStorage.getItem('st_clientes'));
            if(db.find(c => c.nombre === d.nombre)) return { success: false, msg: 'Cliente duplicado' };
            d.id = APP.DAO.getNextId(db);
            db.push(d);
            localStorage.setItem('st_clientes', JSON.stringify(db));
            return { success: true, data: d };
        },
        deleteClient: (id) => {
            let db = JSON.parse(localStorage.getItem('st_clientes'));
            localStorage.setItem('st_clientes', JSON.stringify(db.filter(x => x.id !== id)));
            // Borrado en cascada simple
            let veh = JSON.parse(localStorage.getItem('st_vehiculos'));
            localStorage.setItem('st_vehiculos', JSON.stringify(veh.filter(x => x.idCliente !== id)));
            return true;
        },
        getClients: () => JSON.parse(localStorage.getItem('st_clientes')),

        // --- MÓDULO VEHÍCULOS ---
        createVehicle: (d) => {
            let db = JSON.parse(localStorage.getItem('st_vehiculos'));
            if(db.find(v => v.placas === d.placas)) return { success: false, msg: 'Placas duplicadas' };
            d.id = APP.DAO.getNextId(db);
            db.push(d);
            localStorage.setItem('st_vehiculos', JSON.stringify(db));
            return { success: true, data: d };
        },
        getVehicles: () => JSON.parse(localStorage.getItem('st_vehiculos')),

        // --- MÓDULO ÓRDENES (COMPLEJO: Crea Recepción, Obs y Asignación) ---
        createOrder: (data) => {
            const dbOrd = JSON.parse(localStorage.getItem('st_ordenes'));
            const dbRec = JSON.parse(localStorage.getItem('st_recepciones'));
            const dbObsI = JSON.parse(localStorage.getItem('st_obs_int'));
            const dbObsE = JSON.parse(localStorage.getItem('st_obs_ext'));
            const dbAsig = JSON.parse(localStorage.getItem('st_asignaciones'));

            const nextId = APP.DAO.getNextId(dbOrd);

            // 1. Crear Registros Auxiliares
            const idRec = APP.DAO.getNextId(dbRec);
            dbRec.push({ id: idRec, idVehiculo: data.idVehiculo, km: data.km, gas: data.gas, fecha: new Date().toLocaleDateString() });

            const idObsI = APP.DAO.getNextId(dbObsI);
            dbObsI.push({ id: idObsI, detalle: 'Registro estándar de recepción' });

            const idObsE = APP.DAO.getNextId(dbObsE);
            dbObsE.push({ id: idObsE, detalle: data.obsExt });

            // 2. Crear Orden Maestra
            const orden = {
                id: nextId,
                idVehiculo: data.idVehiculo,
                idRecepcion: idRec,
                idObsInt: idObsI,
                idObsExt: idObsE,
                falla: data.falla,
                idEstado: 'Pendiente'
            };
            dbOrd.push(orden);

            // 3. Crear Asignación Vacía
            dbAsig.push({ idOrden: nextId, idMecanico: null, bitacora: '' });

            // Guardar todo
            localStorage.setItem('st_recepciones', JSON.stringify(dbRec));
            localStorage.setItem('st_obs_int', JSON.stringify(dbObsI));
            localStorage.setItem('st_obs_ext', JSON.stringify(dbObsE));
            localStorage.setItem('st_ordenes', JSON.stringify(dbOrd));
            localStorage.setItem('st_asignaciones', JSON.stringify(dbAsig));

            return orden;
        },
        getOrdersFull: () => {
            const ord = JSON.parse(localStorage.getItem('st_ordenes'));
            const asig = JSON.parse(localStorage.getItem('st_asignaciones'));
            const rec = JSON.parse(localStorage.getItem('st_recepciones'));
            
            return ord.map(o => {
                const a = asig.find(x => x.idOrden === o.id) || {};
                const r = rec.find(x => x.id === o.idRecepcion) || {};
                return { ...o, bitacora: a.bitacora, km: r.km, gas: r.gas };
            });
        },
        updateOrderMechanic: (id, bitacora, estado) => {
            let ord = JSON.parse(localStorage.getItem('st_ordenes'));
            let asig = JSON.parse(localStorage.getItem('st_asignaciones'));
            
            const idxO = ord.findIndex(x => x.id === id);
            if(idxO > -1) ord[idxO].idEstado = estado;
            
            const idxA = asig.findIndex(x => x.idOrden === id);
            if(idxA > -1) asig[idxA].bitacora = bitacora;

            localStorage.setItem('st_ordenes', JSON.stringify(ord));
            localStorage.setItem('st_asignaciones', JSON.stringify(asig));
        },
        deleteOrder: (id) => {
            let db = JSON.parse(localStorage.getItem('st_ordenes'));
            localStorage.setItem('st_ordenes', JSON.stringify(db.filter(x => x.id !== id)));
        },

        // --- INVENTARIO ---
        getInventory: () => JSON.parse(localStorage.getItem('st_refacciones')),
        createProduct: (p) => {
            let db = JSON.parse(localStorage.getItem('st_refacciones'));
            let exist = db.findIndex(x => x.sku === p.sku);
            if(exist > -1) {
                db[exist].stock = parseInt(db[exist].stock) + parseInt(p.stock);
                localStorage.setItem('st_refacciones', JSON.stringify(db));
                return { status: 'updated' };
            }
            p.id = APP.DAO.getNextId(db);
            db.push(p);
            localStorage.setItem('st_refacciones', JSON.stringify(db));
            return { status: 'created' };
        },
        deleteProduct: (id) => {
            let db = JSON.parse(localStorage.getItem('st_refacciones'));
            localStorage.setItem('st_refacciones', JSON.stringify(db.filter(x => x.id !== id)));
        },

        // --- USUARIOS ---
        getUsers: () => JSON.parse(localStorage.getItem('st_usuarios')),
        createUser: (d) => {
            let db = JSON.parse(localStorage.getItem('st_usuarios'));
            if(db.find(u => u.user === d.user)) return { success:false, msg:'Usuario existe' };
            d.id = APP.DAO.getNextId(db);
            db.push(d);
            localStorage.setItem('st_usuarios', JSON.stringify(db));
            return { success:true };
        },
        deleteUser: (id) => {
            if(id === APP.getSession().id) return { success:false, msg:'No auto-eliminar' };
            let db = JSON.parse(localStorage.getItem('st_usuarios'));
            localStorage.setItem('st_usuarios', JSON.stringify(db.filter(x => x.id !== id)));
            return { success:true };
        }
    }
};