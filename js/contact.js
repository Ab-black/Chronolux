document
.getElementById("contact-form")
.addEventListener("submit", function(e){

    e.preventDefault();

    const name =
    document.getElementById("name").value;

    const email =
    document.getElementById("email").value;

    const phone =
    document.getElementById("phone").value;

    const brand =
    document.getElementById("brand").value;

    const model =
    document.getElementById("model").value;

    const message =
    document.getElementById("message").value;

    const text =

`Hello ChronoLux,

Name: ${name}

Email: ${email}

Phone: ${phone}

Brand: ${brand}

Model: ${model}

Message:
${message}`;

    window.open(

`https://wa.me/2349039450751?text=${encodeURIComponent(text)}`,

"_blank"

);

});
