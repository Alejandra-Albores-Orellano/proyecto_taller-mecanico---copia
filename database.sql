-- CREACIÓN DE BASE DE DATOS SEGÚN DIAGRAMA ENTIDAD-RELACIÓN (DER)
CREATE DATABASE IF NOT EXISTS ServiTaller;
USE ServiTaller;

-- === TABLAS CATÁLOGO (Lado Izquierdo del Diagrama) ===

CREATE TABLE Empresa (
    id_Empresa INT PRIMARY KEY AUTO_INCREMENT,
    NombreComercial VARCHAR(100),
    Nombre VARCHAR(150),
    Logotipo VARCHAR(255),
    Llamadas VARCHAR(20),
    Correo VARCHAR(100),
    RFC VARCHAR(20)
);

CREATE TABLE Estado (
    id_estado INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100)
);

CREATE TABLE Municipio (
    id_municipio INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(100),
    id_estado INT,
    FOREIGN KEY (id_estado) REFERENCES Estado(id_estado)
);

CREATE TABLE Sucursal (
    id_Sucursal INT PRIMARY KEY AUTO_INCREMENT,
    id_Empresa INT,
    Nombre VARCHAR(100),
    Calle VARCHAR(100),
    Numero_Exterior VARCHAR(10),
    Numero_Interior VARCHAR(10),
    Colonia VARCHAR(100),
    CP VARCHAR(10),
    id_Municipio INT,
    id_Estado INT,
    FOREIGN KEY (id_Empresa) REFERENCES Empresa(id_Empresa),
    FOREIGN KEY (id_Municipio) REFERENCES Municipio(id_municipio)
);

CREATE TABLE Roles (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(50),
    Descripcion VARCHAR(255)
);

CREATE TABLE Empleados (
    id_empleado INT PRIMARY KEY AUTO_INCREMENT,
    id_Sucursal INT,
    Nombre VARCHAR(50),
    Paterno VARCHAR(50),
    Materno VARCHAR(50),
    RFC VARCHAR(20),
    Calle VARCHAR(100),
    Numero_Exterior VARCHAR(10),
    FOREIGN KEY (id_Sucursal) REFERENCES Sucursal(id_Sucursal)
);

CREATE TABLE Usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    id_empleado INT,
    id_Rol INT,
    Usuario VARCHAR(50) UNIQUE,
    Contrasena VARCHAR(255),
    FOREIGN KEY (id_empleado) REFERENCES Empleados(id_empleado),
    FOREIGN KEY (id_Rol) REFERENCES Roles(id_rol)
);

-- === MÓDULO CLIENTES Y VEHÍCULOS ===

CREATE TABLE Cliente (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    id_Sucursal INT,
    Nombre VARCHAR(150),
    Telefono_1 VARCHAR(20),
    Correo VARCHAR(100),
    Calle VARCHAR(100),
    id_Municipio INT,
    id_Estado INT,
    FOREIGN KEY (id_Sucursal) REFERENCES Sucursal(id_Sucursal)
);

CREATE TABLE Vehiculo (
    id_vehiculo INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT,
    Marca VARCHAR(50),
    Modelo VARCHAR(50),
    Anio INT,
    VIN VARCHAR(30),
    Placas VARCHAR(20) UNIQUE,
    Color VARCHAR(30),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

-- === MÓDULO OPERATIVO (Ordenes, Recepción, Diagnóstico) ===

CREATE TABLE Recepcion (
    id_recepcion INT PRIMARY KEY AUTO_INCREMENT,
    id_vehiculo INT,
    id_usuario INT, -- Recepcionista
    Fecha_Recepcion DATE,
    Hora_Recepcion TIME,
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

CREATE TABLE ObservacionesInt (
    id_observacionesInt INT PRIMARY KEY AUTO_INCREMENT,
    id_vehiculo INT,
    Tablero BOOLEAN,
    Calefaccion BOOLEAN,
    Vestiduras BOOLEAN,
    Otros TEXT,
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo)
);

CREATE TABLE ObservacionesExt (
    id_observacionesExt INT PRIMARY KEY AUTO_INCREMENT,
    id_vehiculo INT,
    LucesFrontales BOOLEAN,
    EspejosLaterales BOOLEAN,
    Llantas BOOLEAN,
    Carroceria TEXT,
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo)
);

CREATE TABLE EstadoGeneral (
    id_EstadoGeneral INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(50), -- Ej: Pendiente, En Proceso, Terminado
    Descripcion VARCHAR(255)
);

CREATE TABLE OrdenDeTrabajo (
    id_orden INT PRIMARY KEY AUTO_INCREMENT,
    id_vehiculo INT,
    id_observacionesExt INT,
    id_observacionesInt INT,
    id_recepcion INT,
    id_EstadoGeneral INT,
    Monto_Total DECIMAL(10,2),
    Recomendaciones TEXT,
    FechaEntrega DATE,
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo),
    FOREIGN KEY (id_EstadoGeneral) REFERENCES EstadoGeneral(id_EstadoGeneral)
);

-- Asignación a Mecánicos
CREATE TABLE AsignacionOrden (
    id_AsignacionOrden INT PRIMARY KEY AUTO_INCREMENT,
    id_orden INT,
    id_usuario INT, -- Mecánico
    FechaInicio DATE,
    Observaciones TEXT, -- Bitácora del mecánico
    FOREIGN KEY (id_orden) REFERENCES OrdenDeTrabajo(id_orden),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

CREATE TABLE ControlCalidad (
    id_ControlCalidad INT PRIMARY KEY AUTO_INCREMENT,
    id_AsignacionOrden INT,
    id_usuario INT, -- Supervisor
    Aprobado BOOLEAN,
    Observaciones TEXT,
    FOREIGN KEY (id_AsignacionOrden) REFERENCES AsignacionOrden(id_AsignacionOrden)
);

-- === MÓDULO INVENTARIO Y VENTAS ===

CREATE TABLE Proveedores (
    id_Proveedor INT PRIMARY KEY AUTO_INCREMENT,
    NombreComercial VARCHAR(100),
    ContactoPrincipal VARCHAR(100),
    Telefono VARCHAR(20)
);

CREATE TABLE Refacciones (
    id_Refaccion INT PRIMARY KEY AUTO_INCREMENT,
    id_Proveedor INT,
    SKU VARCHAR(50) UNIQUE,
    Nombre VARCHAR(100),
    Stock INT,
    StockMinimo INT,
    PrecioVenta DECIMAL(10,2),
    FOREIGN KEY (id_Proveedor) REFERENCES Proveedores(id_Proveedor)
);

CREATE TABLE DetalleOrdenRefaccion (
    id_DetalleOrdenR INT PRIMARY KEY AUTO_INCREMENT,
    id_orden INT,
    id_Refaccion INT,
    Cantidad INT,
    Total DECIMAL(10,2),
    FOREIGN KEY (id_orden) REFERENCES OrdenDeTrabajo(id_orden),
    FOREIGN KEY (id_Refaccion) REFERENCES Refacciones(id_Refaccion)
);

-- === DATOS INICIALES (SEED) ===

INSERT INTO Roles (Nombre) VALUES ('Administrador'), ('Recepcion'), ('Mecanico');
INSERT INTO EstadoGeneral (Nombre) VALUES ('Pendiente'), ('En Proceso'), ('Control Calidad'), ('Terminado');
-- Usuarios: admin/123, recepcion/123, mecanico/123 (Hash en producción)
INSERT INTO Usuarios (Usuario, Contrasena, id_Rol) VALUES 
('admin', '123', 1), ('recepcion', '123', 2), ('mecanico', '123', 3);