<?php
//Solicitud de verificacón previa
header('Access-Control-Allow-Origin:*');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
// Datos de conexión con servidor remoto
$serverName = "172.16.172.24"; // Dirección IP del servidor remoto
$connectionOptions = array(
    "Database" => "QA_SORF", // Nombre de la base de datos
    "Uid" => "sa", // Usuario
    "PWD" => "I_lzc1g", // Contraseña
    "TrustServerCertificate" => true //Certificación
);

// Establecer la conexión
$conn = sqlsrv_connect($serverName, $connectionOptions);

// Comprobar si la conexión fue exitosa
if ($conn === false) {
    echo "Error de conexión: ";
    die(print_r(sqlsrv_errors(), true));
}

// Consulta SQL
$sql = "
SELECT
    CT.nFolio,
    CASE CT.nEstado
        WHEN 1 THEN 'CREADO'
        WHEN 2 THEN 'INICIADO'
        WHEN 3 THEN 'COMPLETADO'
        WHEN 4 THEN 'CANCELADO'
        WHEN 5 THEN 'EN ESPERA DE CARGA'
        WHEN 6 THEN 'EN PROCESO DE CARGA'
        WHEN 7 THEN 'CARGADO Y AUTORIZADO'
        ELSE 'NULL'
    END AS nEstado,
	CT.dFechaLlegada,
    CT.dFechaSalida,
	DATEDIFF(MINUTE, CT.dFechaLlegada, CT.dFechaSalida) AS diferenciaMinutos, -- Calcular la diferencia en minutos
    ISNULL(CT.bFleteCliente, 'NO') AS bFleteCliente,
    CASE CT.nTipoEntrada
        WHEN 1 THEN 'CARRETERO'
        WHEN 2 THEN 'FERROVIARIO'
        ELSE 'NULL'
    END AS nTipoEntrada,
    trans.sRazonSocial,
    trans_line.sPlacas,
    trans_line.sNumEconomico,
    CT.sViajes,
    CT.sPlacasPlana1,
    CT.sPlacasPlana2,
    CASE CT.nTipoOperacion
        WHEN 1 THEN 'ENTRADA'
        WHEN 2 THEN 'SALIDA'
        ELSE 'NULL'
    END AS nTipoOperacion,
    CASE turno.nIdManiobristaOrigen019
        WHEN 12 THEN 'LC LOGISTICS GPS'
        WHEN 18 THEN 'TUMII'
        ELSE 'NULL'
    END AS nIdManiobristaOrigen019,
    CASE turno.nIdManiobristaDestino019
        WHEN 12 THEN 'LC LOGISTICS GPS'
        WHEN 18 THEN 'TUMII'
        ELSE 'NULL'
    END AS nIdManiobristaDestino019
FROM
    [WMS].[WMS_22_CONTROL_TRANSPORTE] CT
JOIN
    [WMS].[WMS_20_LINEA_TRANS_TRANSPORTE] trans_line
    ON CT.nIdLineaTransTransporte20 = trans_line.nIdLineaTransTransporte20
JOIN
    [WMS].[WMS_11_TRANSPORTISTA] trans
    ON trans_line.nIdTransportista11 = trans.nIdTransportista11
JOIN
    [SORF].[SORF_083_Turno] turno
    ON CT.nIdControlTransporte22 = turno.nIdControlTransporte22
WHERE
    CT.dFechaSalida >= '2025-01-01'  -- Filtrar desde 2025

ORDER BY 
    CT.dFechaSalida;  -- Ordenar por la fecha de llegada
";

// Ejecutar la consulta
$query = sqlsrv_query($conn, $sql);

// Comprobar si la consulta fue exitosa
if ($query === false) {
    die(print_r(sqlsrv_errors(), true));
} else {
    $resultados = [];
    // Recorrer los resultados y guardarlos en un arreglo
    while ($row = sqlsrv_fetch_array($query, SQLSRV_FETCH_ASSOC)) {
        // Asegurarse de que las fechas no sean NULL y formatearlas correctamente
        $row['dFechaSalida'] = (!is_null($row['dFechaSalida']) && $row['dFechaSalida'] instanceof DateTime) ? $row['dFechaSalida']->format('Y-m-d H:i:s') : 'Sin fecha';
        $row['dFechaLlegada'] = (!is_null($row['dFechaLlegada']) && $row['dFechaLlegada'] instanceof DateTime) ? $row['dFechaLlegada']->format('Y-m-d H:i:s') : 'Sin fecha';
        
        // Verificar que el valor de bFleteCliente sea correcto
        $row['bFleteCliente'] = ($row['bFleteCliente'] == 0) ? 'NO' : $row['bFleteCliente'];

        $resultados[] = $row;
    }

    // Cerrar la conexión
    sqlsrv_close($conn);

    // Establecer el encabezado de tipo de contenido a JSON
    header('Content-Type: application/json');
    // Retornar los datos como JSON
    echo json_encode($resultados);
}
?>

