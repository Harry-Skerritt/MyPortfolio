export async function onRequestPost(context) {
    const { request, env } = context;
    const formData = await request.formData();

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
        return Response.redirect(`${new URL(request.url).origin}/thanks`, 303);
    } else {
        return new Response("Failed to send email", { status: 500 });
    }
}