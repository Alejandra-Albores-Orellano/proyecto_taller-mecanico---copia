-- CREACIÓN COMPLETA BASE DE DATOS SERVITALLER
CREATE DATABASE IF NOT EXISTS ServiTaller;
USE ServiTaller;

-- === CATÁLOGOS ===
CREATE TABLE Roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50),
    Descripcion VARCHAR(255)
);

CREATE TABLE EstadoOrden (
    id_EstadoOrden INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) -- Pendiente, En Proceso, Control Calidad, Terminado
);

CREATE TABLE EstadoRevision (
    id_EstadoRevision INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) -- Aprobado, Rechazado
);

CREATE TABLE FormasDePago (
    id_formaPago INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50)
);

-- === EMPRESA Y SUCURSALES ===
CREATE TABLE Empresa (
    id_Empresa INT AUTO_INCREMENT PRIMARY KEY,
    NombreComercial VARCHAR(100),
    RFC VARCHAR(15)
);

CREATE TABLE Sucursal (
    id_Sucursal INT AUTO_INCREMENT PRIMARY KEY,
    id_Empresa INT,
    Nombre VARCHAR(100),
    FOREIGN KEY (id_Empresa) REFERENCES Empresa(id_Empresa)
);

-- === USUARIOS Y EMPLEADOS ===
CREATE TABLE Empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    id_Sucursal INT,
    Nombre VARCHAR(50),
    Paterno VARCHAR(50),
    RFC VARCHAR(13),
    FOREIGN KEY (id_Sucursal) REFERENCES Sucursal(id_Sucursal)
);

CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT, -- Opcional en prototipo
    id_Rol INT NOT NULL,
    Usuario VARCHAR(50) UNIQUE,
    Contrasena VARCHAR(255),
    FOREIGN KEY (id_Rol) REFERENCES Roles(id_rol)
);

-- === CLIENTES Y VEHÍCULOS ===
CREATE TABLE Cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(150),
    Telefono_1 VARCHAR(20),
    Correo VARCHAR(100),
    RFC VARCHAR(13),
    Calle VARCHAR(100),
    Colonia VARCHAR(100)
);

CREATE TABLE Vehiculo (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT,
    Marca VARCHAR(50),
    Modelo VARCHAR(50),
    Anio INT,
    Placas VARCHAR(20) UNIQUE,
    VIN VARCHAR(30),
    Color VARCHAR(30),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

-- === OPERACIÓN (RECEPCIÓN Y ÓRDENES) ===
CREATE TABLE Recepcion (
    id_recepcion INT AUTO_INCREMENT PRIMARY KEY,
    id_vehiculo INT,
    id_usuario INT, -- Recepcionista
    Fecha_Recepcion DATE,
    Hora_Recepcion TIME,
    Kilometraje INT,
    NivelGasolina VARCHAR(20),
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo)
);

CREATE TABLE ObservacionesInt (
    id_observacionesInt INT AUTO_INCREMENT PRIMARY KEY,
    Tablero BOOLEAN,
    Asientos BOOLEAN,
    Alfombras BOOLEAN,
    Otros TEXT
);

CREATE TABLE ObservacionesExt (
    id_observacionesExt INT AUTO_INCREMENT PRIMARY KEY,
    Luces BOOLEAN,
    Espejos BOOLEAN,
    Llantas BOOLEAN,
    Carroceria TEXT
);

CREATE TABLE OrdenDeTrabajo (
    id_orden INT AUTO_INCREMENT PRIMARY KEY,
    id_vehiculo INT,
    id_recepcion INT,
    id_observacionesInt INT,
    id_observacionesExt INT,
    id_EstadoOrden INT,
    FallaReportada TEXT,
    FechaIngreso DATETIME,
    FOREIGN KEY (id_recepcion) REFERENCES Recepcion(id_recepcion)
);

CREATE TABLE AsignacionOrden (
    id_AsignacionOrden INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT,
    id_usuario INT, -- Mecánico
    FechaInicio DATE,
    Observaciones TEXT, -- Bitácora
    FOREIGN KEY (id_orden) REFERENCES OrdenDeTrabajo(id_orden)
);

CREATE TABLE ControlCalidad (
    id_ControlCalidad INT AUTO_INCREMENT PRIMARY KEY,
    id_AsignacionOrden INT,
    id_usuario INT, -- Supervisor
    id_EstadoRevision INT, -- Aprobado/Rechazado
    Comentarios TEXT,
    FOREIGN KEY (id_AsignacionOrden) REFERENCES AsignacionOrden(id_AsignacionOrden)
);

-- === INVENTARIO ===
CREATE TABLE Proveedores (
    id_Proveedor INT AUTO_INCREMENT PRIMARY KEY,
    NombreComercial VARCHAR(100),
    Telefono VARCHAR(20)
);

CREATE TABLE Refacciones (
    id_Refaccion INT AUTO_INCREMENT PRIMARY KEY,
    id_Proveedor INT,
    SKU VARCHAR(50) UNIQUE,
    Nombre VARCHAR(100),
    Stock INT,
    StockMinimo INT,
    PrecioVenta DECIMAL(10,2),
    FOREIGN KEY (id_Proveedor) REFERENCES Proveedores(id_Proveedor)
);

-- DATOS SEMILLA
INSERT INTO Roles (Nombre) VALUES ('Administrador'), ('Recepcion'), ('Mecanico');
INSERT INTO Usuarios (Usuario, Contrasena, id_Rol) VALUES ('admin', '123', 1), ('recepcion', '123', 2), ('mecanico', '123', 3);