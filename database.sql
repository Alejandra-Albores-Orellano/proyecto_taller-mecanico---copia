-- CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS ServiTaller;
USE ServiTaller;

-- TABLA USUARIOS (Roles y Accesos)
CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- En producción usar Hash
    rol ENUM('admin', 'recepcion', 'mecanico') NOT NULL
);

-- TABLA CLIENTES
CREATE TABLE Clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    rfc VARCHAR(20),
    direccion TEXT
);

-- TABLA VEHÍCULOS
CREATE TABLE Vehiculos (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    placas VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(30),
    color VARCHAR(30),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE CASCADE
);

-- TABLA INVENTARIO (Refacciones)
CREATE TABLE Inventario (
    id_refaccion INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock_actual INT NOT NULL,
    stock_minimo INT NOT NULL
);

-- TABLA ÓRDENES DE TRABAJO
CREATE TABLE Ordenes (
    id_orden INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_vehiculo INT NOT NULL,
    falla_reportada TEXT NOT NULL,
    trabajo_realizado TEXT, -- Campo para el mecánico
    estado ENUM('Pendiente', 'En Proceso', 'Terminado', 'Entregado') DEFAULT 'Pendiente',
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    costo_total DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculos(id_vehiculo)
);

-- DATOS INICIALES (Semilla)
INSERT INTO Usuarios (nombre_completo, username, password, rol) VALUES 
('Ing. Luis Trujillo', 'admin', '123', 'admin'),
('Abril Guzmán', 'recepcion', '123', 'recepcion'),
('José Herrera', 'mecanico', '123', 'mecanico');

INSERT INTO Inventario (sku, nombre, precio_venta, stock_actual, stock_minimo) VALUES
('ACE-001', 'Aceite Sintético 5W-30', 450.00, 20, 5),
('FIL-002', 'Filtro de Aire Universal', 150.00, 3, 5),
('BUJ-NGK', 'Bujía Iridium', 120.00, 50, 10);