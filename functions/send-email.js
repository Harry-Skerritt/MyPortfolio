export async function onRequestPost(context) {
    const { request, env } = context;
    const formData = await request.formData();

    // Turnstile Verification
    const token = formData.get('cf-turnstile-response');
    const ip = request.headers.get('CF-Connecting-IP');

    let verifyFormData = new FormData();
    verifyFormData.append('secret', env.TURNSTILE_SECRET_KEY);
    verifyFormData.append('response', token);
    verifyFormData.append('remoteip', ip);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        body: verifyFormData,
        method: 'POST',
    });

    const outcome = await result.json();
    if (!outcome.success) {
        return new Response("Security check failed. Please refresh and try again.", { status: 403 });
    }

    // Verified
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Basic Spam Check
    if (formData.get('honeypot')) {
        return new Response("Spam detected", { status: 400 });
    }

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: `Portfolio Contact <contact@${env.DOMAIN_NAME}>`,

            reply_to: email,
            to: env.PERSONAL_EMAIL,

            subject: `New Message from ${name}`,
            text: `From: ${email}\n\nMessage: ${message}`,
        }),
    });

    if (res.ok) {
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `Harry Skerritt <no-reply@${env.DOMAIN_NAME}>`,
                to: email,
                subject: `Thanks for reaching out, ${name}!`,
                html: `
                    <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                        <h2>Hi ${name},</h2>
                        <p>Thanks for getting in touch through my portfolio. I've received your message and will get back to you as soon as I can.</p>
                        <p>Best regards,<br /><strong>Harry Skerritt</strong></p>
                        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
                        <small style="color: #888;">This is an automated confirmation. Please do not reply directly to this email.</small>
                    </div>
                `,
            }),
        });

        return Response.redirect(`${new URL(request.url).origin}/thanks`, 303);
    } else {
        return new Response("Failed to send email", { status: 500 });
    }
}