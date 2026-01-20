export function generateContactEmailTemplate({ name, email, message }) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Nuevo mensaje de contacto</title>

    <style>
      /* Defaults / resets básicos */
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; }
      a { text-decoration: none; }
      
      /* Mobile tweaks */
      @media only screen and (max-width: 600px) {
        .wrapper { padding: 14px 10px !important; }
        .card { width: 100% !important; border-radius: 12px !important; }
        .header { padding: 16px !important; }
        .content { padding: 16px !important; }
        .h1 { font-size: 20px !important; }
        .btn { display: inline-block !important; padding: 10px 12px !important; font-size: 13px !important; border-radius: 8px !important; }
        
        /* Mensaje en móvil: centrado y “en una línea visual” (sin respetar saltos) */
        .message-text { text-align: center !important; white-space: normal !important; }

        /* Email en móvil: una sola línea (nowrap) */
        .email-link { 
          white-space: nowrap !important;
          display: inline-block !important;
          font-size: 14px !important;
        }
        .email-wrapper { text-align: center !important; }
      }
    </style>
  </head>

  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <!-- Wrapper background (tabla para compatibilidad iPhone/Outlook) -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6f7fb;">
      <tr>
        <td align="center" style="padding:24px 12px;" class="wrapper">
          
          <!-- Card -->
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0"
                 class="card"
                 style="width:640px;max-width:640px;background:#ffffff;border:1px solid #e7e9ee;border-radius:12px;overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td class="header" style="padding:20px;background:#ff6079;color:#fff;">
                <div style="font-size:16px;opacity:.9;">Portfolio</div>
                <div class="h1" style="font-size:22px;font-weight:700;line-height:1.2;margin-top:6px;">
                  Nuevo mensaje de contacto
                </div>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td class="content" style="padding:20px;">
                <div style="margin:0 0 14px 0;font-size:14px;color:#444;">
                  Has recibido un nuevo mensaje desde el formulario de contacto.
                </div>

                <!-- Info box -->
                <div style="border:1px solid #eef0f5;border-radius:10px;padding:14px;background:#fbfbfd;">
                  
                  <div style="margin:0 0 10px 0;">
                    <div style="font-size:12px;color:#666;margin-bottom:4px;">Nombre</div>
                    <div style="font-size:16px;font-weight:600;color:#111;">${name}</div>
                  </div>

                  <div style="margin:0 0 10px 0;">
                    <div style="font-size:12px;color:#666;margin-bottom:4px;">Email</div>
                    
                    <!-- Email wrapper + link -->
                    <div class="email-wrapper" style="font-size:16px;font-weight:600;word-break:break-word;">
                      <a class="email-link" href="mailto:${email}" style="color:#ff6079;">
                        ${email}
                      </a>
                    </div>
                  </div>

                  <div style="margin:0;">
                    <div style="font-size:12px;color:#666;margin-bottom:6px;">Mensaje</div>
                    <div class="message-text" style="font-size:15px;line-height:1.6;color:#111;white-space:pre-wrap;word-break:break-word;text-align:left;">
                      ${message}
                    </div>
                  </div>
                </div>

                <!-- CTA -->
                <div style="margin-top:16px;">
                  <a class="btn"
                     href="mailto:${email}"
                     style="display:inline-block;background:#ff6079;color:#fff;padding:12px 16px;border-radius:10px;font-weight:700;font-size:14px;">
                    Responder
                  </a>
                </div>

                <!-- Footer -->
                <div style="margin-top:22px;padding-top:14px;border-top:1px solid #eef0f5;font-size:12px;color:#777;">
                  Este correo fue generado automáticamente desde tu API Portafolio.
                </div>
              </td>
            </tr>
          </table>

          <!-- Small footer -->
          <div style="max-width:640px;margin:10px auto 0 auto;font-size:11px;color:#999;text-align:center;">
            © 2026 Portfolio
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
