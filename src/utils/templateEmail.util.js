export function generateContactEmailTemplate({ name, email, message }) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nuevo mensaje de contacto</title>

    <style>
      /* Algunos clientes de email sí respetan esto (Gmail móvil/desktop, Apple Mail, etc.) */
      @media screen and (max-width: 600px) {
        .wrapper { padding: 14px 10px !important; }
        .card { border-radius: 10px !important; }
        .content { padding: 16px !important; }
        .header { padding: 16px !important; }
        .h1 { font-size: 20px !important; }
        .muted { font-size: 13px !important; }
        .btn { display: block !important; width: 100% !important; text-align: center !important; }
      }
    </style>
  </head>

  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <!-- Wrapper -->
    <div class="wrapper" style="width:100%;padding:24px 12px;">
      <!-- Card -->
      <div class="card" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e7e9ee;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <div class="header" style="padding:20px 20px;background:#ff6079;color:#fff;">
          <div style="font-size:16px;opacity:.9;">Portfolio</div>
          <div class="h1" style="font-size:22px;font-weight:700;line-height:1.2;margin-top:6px;">
            Nuevo mensaje de contacto
          </div>
        </div>

        <!-- Content -->
        <div class="content" style="padding:20px;">
          <div class="muted" style="margin:0 0 14px 0;font-size:14px;color:#444;">
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
              <div style="font-size:16px;font-weight:600;word-break:break-word;">
                <a href="mailto:${email}"
                   style="color:#ff6079;text-decoration:none;">
                  ${email}
                </a>
              </div>
            </div>

            <div style="margin:0;">
              <div style="font-size:12px;color:#666;margin-bottom:6px;">Mensaje</div>
              <div style="font-size:15px;line-height:1.55;color:#111;white-space:pre-wrap;word-break:break-word;">
                ${message}
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div style="margin-top:16px;">
            <a class="btn"
               href="mailto:${email}"
               style="display:inline-block;background:#ff6079;color:#fff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:700;font-size:14px;">
              Responder
            </a>
          </div>

          <!-- Footer -->
          <div style="margin-top:22px;padding-top:14px;border-top:1px solid #eef0f5;font-size:12px;color:#777;">
            Este correo fue generado automáticamente desde tu API Portafolio.
          </div>
        </div>
      </div>

      <!-- Small footer -->
      <div style="max-width:640px;margin:10px auto 0 auto;font-size:11px;color:#999;text-align:center;">
        © 2026 Portfolio
      </div>
    </div>
  </body>
</html>`;
}
