<?php
header('Content-Type: application/json');

// Configuración de correo
$config = [
    'admin_email' => 'info@injertoscapilaresvalladolid.com',
    'from_email' => 'noreply@injertoscapilaresvalladolid.com',
    'recaptcha_secret' => 'TU_CLAVE_SECRETA_RECAPTCHA'
];

// Función para validar el email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Función para sanitizar input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Función para validar reCAPTCHA
function verifyRecaptcha($recaptcha_response) {
    global $config;
    
    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
        'secret' => $config['recaptcha_secret'],
        'response' => $recaptcha_response
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
    return json_decode($result)->success;
}

try {
    // Verificar método de solicitud
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Obtener y validar datos
    $nombre = isset($_POST['nombre']) ? sanitizeInput($_POST['nombre']) : '';
    $email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
    $telefono = isset($_POST['telefono']) ? sanitizeInput($_POST['telefono']) : '';
    $mensaje = isset($_POST['mensaje']) ? sanitizeInput($_POST['mensaje']) : '';
    $tratamiento = isset($_POST['tratamiento']) ? sanitizeInput($_POST['tratamiento']) : '';
    $recaptcha_response = isset($_POST['g-recaptcha-response']) ? $_POST['g-recaptcha-response'] : '';

    // Validaciones
    if (empty($nombre) || empty($email) || empty($telefono) || empty($mensaje)) {
        throw new Exception('Por favor, complete todos los campos obligatorios');
    }

    if (!isValidEmail($email)) {
        throw new Exception('Por favor, introduzca un email válido');
    }

    // Verificar reCAPTCHA
    if (!verifyRecaptcha($recaptcha_response)) {
        throw new Exception('Por favor, verifique que no es un robot');
    }

    // Preparar el correo para el administrador
    $to = $config['admin_email'];
    $subject = "Nueva consulta desde la web - " . $tratamiento;
    
    $message = "Se ha recibido una nueva consulta:\n\n";
    $message .= "Nombre: " . $nombre . "\n";
    $message .= "Email: " . $email . "\n";
    $message .= "Teléfono: " . $telefono . "\n";
    $message .= "Tratamiento: " . $tratamiento . "\n";
    $message .= "Mensaje: " . $mensaje . "\n";

    $headers = "From: " . $config['from_email'] . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Enviar correo al administrador
    if (!mail($to, $subject, $message, $headers)) {
        throw new Exception('Error al enviar el mensaje. Por favor, inténtelo de nuevo más tarde');
    }

    // Preparar el correo de confirmación para el usuario
    $user_subject = "Hemos recibido tu consulta - Clínica de Injertos Capilares Valladolid";
    
    $user_message = "Estimado/a " . $nombre . ",\n\n";
    $user_message .= "Gracias por contactar con la Clínica de Injertos Capilares Valladolid. ";
    $user_message .= "Hemos recibido tu consulta y nos pondremos en contacto contigo lo antes posible.\n\n";
    $user_message .= "Resumen de tu consulta:\n";
    $user_message .= "Tratamiento: " . $tratamiento . "\n";
    $user_message .= "Mensaje: " . $mensaje . "\n\n";
    $user_message .= "Si tienes alguna duda adicional, no dudes en contactarnos.\n\n";
    $user_message .= "Saludos cordiales,\n";
    $user_message .= "Equipo de Clínica de Injertos Capilares Valladolid";

    $user_headers = "From: " . $config['from_email'] . "\r\n";
    $user_headers .= "X-Mailer: PHP/" . phpversion();

    // Enviar correo de confirmación al usuario
    mail($email, $user_subject, $user_message, $user_headers);

    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.'
    ]);

} catch (Exception $e) {
    // Respuesta de error
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
