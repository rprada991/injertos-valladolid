<?php
// Configuración general
define('SITE_NAME', 'Clínica de Injertos Capilares Valladolid');
define('SITE_EMAIL', 'info@injertoscapilaresvalladolid.com');
define('ADMIN_EMAIL', 'admin@injertoscapilaresvalladolid.com');

// Configuración de reCAPTCHA
define('RECAPTCHA_SITE_KEY', 'TU_CLAVE_PUBLICA_RECAPTCHA');
define('RECAPTCHA_SECRET_KEY', 'TU_CLAVE_SECRETA_RECAPTCHA');

// Configuración de correo
define('SMTP_HOST', 'smtp.tuservidor.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'tu_usuario_smtp');
define('SMTP_PASSWORD', 'tu_contraseña_smtp');
define('SMTP_SECURE', 'tls');

// Configuración de mensajes
$email_templates = [
    'admin_notification' => [
        'subject' => 'Nueva consulta desde la web - {tratamiento}',
        'body' => "
            Se ha recibido una nueva consulta:
            
            Nombre: {nombre}
            Email: {email}
            Teléfono: {telefono}
            Tratamiento: {tratamiento}
            
            Mensaje:
            {mensaje}
            
            Fecha: {fecha}
            IP: {ip}
        "
    ],
    'user_confirmation' => [
        'subject' => 'Hemos recibido tu consulta - ' . SITE_NAME,
        'body' => "
            Estimado/a {nombre},
            
            Gracias por contactar con " . SITE_NAME . ". Hemos recibido tu consulta y nos pondremos en contacto contigo lo antes posible.
            
            Resumen de tu consulta:
            Tratamiento: {tratamiento}
            Mensaje: {mensaje}
            
            Si tienes alguna duda adicional, no dudes en contactarnos.
            
            Saludos cordiales,
            Equipo de " . SITE_NAME . "
        "
    ]
];

// Función para validar datos
function validateFormData($data) {
    $errors = [];
    
    // Validar nombre
    if (empty($data['nombre'])) {
        $errors['nombre'] = 'El nombre es obligatorio';
    }
    
    // Validar email
    if (empty($data['email'])) {
        $errors['email'] = 'El email es obligatorio';
    } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'El email no es válido';
    }
    
    // Validar teléfono
    if (empty($data['telefono'])) {
        $errors['telefono'] = 'El teléfono es obligatorio';
    } elseif (!preg_match('/^[0-9]{9}$/', $data['telefono'])) {
        $errors['telefono'] = 'El teléfono no es válido';
    }
    
    // Validar mensaje
    if (empty($data['mensaje'])) {
        $errors['mensaje'] = 'El mensaje es obligatorio';
    }
    
    return $errors;
}

// Función para sanitizar datos
function sanitizeFormData($data) {
    $sanitized = [];
    
    foreach ($data as $key => $value) {
        if (is_string($value)) {
            $sanitized[$key] = htmlspecialchars(strip_tags(trim($value)));
        } else {
            $sanitized[$key] = $value;
        }
    }
    
    return $sanitized;
}

// Función para generar respuesta JSON
function jsonResponse($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Función para registrar errores
function logError($error, $context = []) {
    $logFile = __DIR__ . '/logs/error.log';
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? json_encode($context) : '';
    
    $logMessage = "[$timestamp] $error $contextStr\n";
    
    error_log($logMessage, 3, $logFile);
}

// Función para verificar reCAPTCHA
function verifyRecaptcha($response) {
    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
        'secret' => RECAPTCHA_SECRET_KEY,
        'response' => $response
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result === false) {
        return false;
    }
    
    $result = json_decode($result, true);
    return isset($result['success']) && $result['success'] === true;
}

// Función para enviar correo usando PHPMailer
function sendEmail($to, $subject, $body, $from = null) {
    require_once __DIR__ . '/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/PHPMailer/SMTP.php';
    require_once __DIR__ . '/PHPMailer/Exception.php';
    
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    
    try {
        // Configuración del servidor
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port = SMTP_PORT;
        
        // Remitentes y destinatarios
        $mail->setFrom($from ?? SITE_EMAIL, SITE_NAME);
        $mail->addAddress($to);
        
        // Contenido
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        
        $mail->send();
        return true;
    } catch (Exception $e) {
        logError('Error al enviar correo: ' . $mail->ErrorInfo);
        return false;
    }
}
?>
