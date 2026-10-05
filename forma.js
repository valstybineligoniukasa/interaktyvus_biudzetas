// ==========================================
// 3 KLAUSIMAS → 4 KLAUSIMO RODYMAS
// ==========================================

const sveikatosAtsakymai = document.querySelectorAll(
    'input[name="susijes_sveikata"]'
);

const question4 = document.getElementById('question4');

// Pradžioje 4 klausimas paslėptas
question4.style.display = 'none';

sveikatosAtsakymai.forEach(input => {

    input.addEventListener('change', function () {

        if (this.value === 'taip') {

            question4.style.display = 'block';

        } else {

            question4.style.display = 'none';

            document.querySelectorAll(
                'input[name="sveikatos_sistema"]'
            ).forEach(input => {
                input.checked = false;
            });

        }

    });

});

document.getElementById('saveButton').addEventListener('click', function () {

    // ==========================================
    // 1. ASMENS DUOMENYS
    // ==========================================

    const amzius = document.querySelector(
        'input[name="amzius"]:checked'
    );

    const issilavinimas = document.querySelector(
        'input[name="issilavinimas"]:checked'
    );

    const susijesSveikata = document.querySelector(
        'input[name="susijes_sveikata"]:checked'
    );

    const pasirinktaSistema = document.querySelector(
        'input[name="sveikatos_sistema"]:checked'
    );


    // ==========================================
    // 2. PRIVALOMI FORMOS KLAUSIMAI
    // ==========================================

    if (!amzius || !issilavinimas || !susijesSveikata) {

        const klaidosModal = new bootstrap.Modal(
            document.getElementById('klaidosModal')
        );

        klaidosModal.show();

        return;
    }


    // ==========================================
    // 3. SVEIKATOS SISTEMOS KLAUSIMAS
    // ==========================================

    let sveikatosSistema = null;

    if (susijesSveikata.value === 'taip') {

        if (!pasirinktaSistema) {

            const klaidosModal = new bootstrap.Modal(
                document.getElementById('klaidosModal')
            );

            klaidosModal.show();

            return;
        }

        sveikatosSistema = pasirinktaSistema.value;
    }


    // ==========================================
    // 4. BIUDŽETAS NEGALI BŪTI DEFICITINIS
    // ==========================================

    if (biudzetasDeficitinis) {

        const deficitinisModal = new bootstrap.Modal(
            document.getElementById('deficitinis')
        );

        deficitinisModal.show();

        return;
    }


    // ==========================================
    // 5. BIUDŽETO KLAUSIMAI
    // ==========================================

    const klausimuGrupes = [
        'vdu',
        'asp-paslaugos',
        'vaistai',
        'psd_imokos_padidinimas',
        'psd_padidinimas_tarifas',
        'psd_lengvatos_naikinimas'
    ];


    // Patikriname, ar kiekvienas klausimas atsakytas

    for (const name of klausimuGrupes) {

        const atsakymas = document.querySelector(
            `input[name="${name}"]:checked`
        );

        if (!atsakymas) {

            const modalas = new bootstrap.Modal(
                document.getElementById('biudzetoKlausimai')
            );

            modalas.show();

            return;
        }
    }


    // ==========================================
    // 6. VIENAS GALUTINIS OBJEKTAS
    // ==========================================

    const duomenys = {

        amzius: amzius.value,

        issilavinimas: issilavinimas.value,

        susijes_su_sveikatos_prieziuros_sistema:
            susijesSveikata.value,

        susiejimo_tipas:
            sveikatosSistema
    };


    // ==========================================
    // 7. PRIDEDAME BIUDŽETO ATSAKYMUS
    // ==========================================

    klausimuGrupes.forEach(name => {

        duomenys[name] = [];

        document.querySelectorAll(
            `input[name="${name}"]:checked`
        ).forEach(input => {

            duomenys[name].push(input.value);

        });

    });


    // ==========================================
    // 8. 1A KLAUSIMO PRIORITETAI
    // ==========================================

    const prioritetai = [];

    document.querySelectorAll(
        '#answers_1_a .answer_1_a'
    ).forEach(element => {

        prioritetai.push(element.dataset.value);

    });

    duomenys.prioritetas_vdu = prioritetai;

    const turnstileToken =
        document.querySelector(
        '[name="cf-turnstile-response"]'
    )?.value;

    const payload = {
        ...duomenys,
        turnstileToken
    };

    console.log(payload);

    const siunciamaModal = new bootstrap.Modal(
                    document.getElementById('siunciamaModal')
                );
    siunciamaModal.show();

    fetch('https://mano-apkalusa-api.sarunas-likas.workers.dev', {
        method: 'POST',
        mode: 'cors', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }
    )
        .then(async response => {

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Serverio klaida: ' + response.status);
            }
            return data;
        })
        .then(data => {
            if (data.status === 'success') {

                siunciamaModal.hide();
                // Išvalome visą formą
                document.getElementById('surveyForm').reset();
                // Papildomai išvalome checkbox'us
                document.querySelectorAll(
                    'input[type="checkbox"]'
                ).forEach(input => {
                    input.checked = false;
                });
                // Vėl paslepiame 4 klausimą
                question4.style.display = 'none';

                // Perskaičiuojame lentelę
                perskaiciuotiLentele();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                // Parodome sėkmės modalą
                const aciuModal = new bootstrap.Modal(
                    document.getElementById('aciuModal')
                );
                aciuModal.show();
            } else {
                
                console.error(
                    'Serveris atmetė duomenis:',
                    data.message
                );
            }
        })
        .catch(error => {
            console.error(
                'Klaida siunčiant duomenis:',
                error
            );
        });
});