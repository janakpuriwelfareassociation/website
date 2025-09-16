(function ($) {
    "use strict";
    var WidgetFormHandler = function ($scope, $) {
        var container = $scope[0].querySelector('.tpaep-form-container');
        var form = container.querySelector('.tpaep-form');

        var formdata = container.dataset.formdata ? JSON.parse(container.dataset.formdata) : {};
        var requiredMask = formdata.Required_mask;
        var integrationData = container?.dataset?.integration ? JSON.parse(container.dataset.integration) : {};

        const requiredAsterisks = container.querySelectorAll('.tpaep-required-asterisk');
        requiredAsterisks.forEach(asterisk => {
            asterisk.style.display = requiredMask === 'hide-asterisks' ? 'none' : 'inline';
        });

        var messages = {
            invalidForm: formdata.invalid_form || "Invalid form submission.",
            successMessage: formdata.success_message || "Your message has been sent successfully.",
            formError: formdata.form_error || "There was an error with the form submission.",
            requiredFieldsError: formdata.required_fields || "Please fill in the required fields.",
            serverError: formdata.server_error || "Server error, please try again later."
        };

        var isSubmitting = false;

        container.querySelectorAll(".tpaep-form-field").forEach(el => {
            let tabletWidth = el.getAttribute("data-tablet-width");
            let mobileWidth = el.getAttribute("data-mobile-width");
            let desktopWidth = el.getAttribute("data-width");

            if (window.innerWidth < 768) {
                el.style.width = mobileWidth + "%";
            } else if (window.innerWidth <= 1024) {
                el.style.width = tabletWidth + "%";
            } else {
                el.style.width = desktopWidth + "%";
            }
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (isSubmitting) return;

            isSubmitting = true;
            clearMessages();

            var isValid = true;
            var formData = {};
            var formFields = [];

            const checkboxGroups = new Set();

            form.querySelectorAll('.tpaep-form-field').forEach(field => {
                const inputs = field.querySelectorAll('input, textarea, select');
                if (!inputs.length) return;

                const label = field.querySelector('label') ? field.querySelector('label').textContent.trim() : '';
                const inputType = inputs[0].type;
                const inputName = inputs[0].name;

                // Handle checkbox and radio groups
                if ((inputType === 'checkbox' || inputType === 'radio') && inputName) {
                    // Avoid validating the same checkbox group multiple times
                    if (checkboxGroups.has(inputName)) return;
                    checkboxGroups.add(inputName);

                    const allGroupInputs = form.querySelectorAll(`input[name="${inputName}"]`);
                    let selected = [];
                    let isRequired = false;

                    allGroupInputs.forEach(input => {
                        if (input.required) isRequired = true;
                        if (input.checked) selected.push(input.value);
                    });

                    if (isRequired && selected.length === 0) {
                        isValid = false;
                        showFieldError(allGroupInputs[0], messages.requiredFieldsError.replace('%field%', label));
                    }

                    if (inputType === 'checkbox') {
                        if (inputName === 'agree_to_terms') {
                            formData[inputName] = selected.length > 0 ? 'yes' : 'no';
                        } else {
                            formData[inputName] = selected;
                        }
                    } else if (inputType === 'radio' && selected.length > 0) {
                        formData[inputName] = selected[0];
                    }

                    return; // Skip further processing for this group
                }

                // Handle other input types
                inputs.forEach(input => {
                    const inputValue = input.value.trim();
                    const inputID = input.getAttribute('id') || '';
                    const inputName = input.getAttribute('name') || '';

                    if (!inputName) return;

                    formData[inputName] = inputValue;

                    formFields.push({
                        field_id: inputID,
                        field_name: inputName,
                        field_value: inputValue
                    });

                    if (input.required && inputValue === '') {
                        isValid = false;
                        showFieldError(input, messages.requiredFieldsError.replace('%field%', label));
                    }
                });
            });

            if (!isValid) {
                displayMessage(messages.invalidForm, 'error');
                isSubmitting = false;
                return;
            }

            var isUsingRecaptcha = typeof grecaptcha !== 'undefined' && document.querySelector('.rc-anchor');

            var isUsingTurnstile = typeof turnstile !== 'undefined' && document.querySelector('.cf-turnstile');

            var turnstileResponse = document.querySelector('input[name="cf-turnstile-response"], textarea[name="cf-turnstile-response"]');
            var turnstileToken = turnstileResponse ? turnstileResponse.value : '';

            var googleSiteKey = formdata.google_site_key;

            if (isUsingRecaptcha && typeof grecaptcha !== 'undefined' && typeof grecaptcha.execute === 'function' && googleSiteKey) {
                grecaptcha.ready(function () {
                    grecaptcha.execute(googleSiteKey, { action: 'submit' }).then(function (recaptchaToken) {
                        var formSecurity = {
                            'g-recaptcha-response': recaptchaToken
                        };
                        submitForm(formData, formFields, formSecurity);
                    });
                });
            } else if (isUsingTurnstile && turnstileToken) {
                var formSecurity = {
                    'cf-turnstile-response': turnstileToken
                };
                submitForm(formData, formFields, formSecurity);
            } else {
                submitForm(formData, formFields, {});
            }

        });

        var submitForm = function (formData, formFields, formSecurity) {
            $.ajax({
                url: theplus_ajax_url,
                type: 'POST',
                data: {
                    action: 'tpaep_form_submission',
                    form_data: JSON.stringify(formData),
                    form_security: JSON.stringify(formSecurity),
                    integration: integrationData,
                    form_fields: JSON.stringify(formFields),
                },
                success: function (response) {
                    if (response?.success) {
                        displayMessage(messages.successMessage, 'success');
                        form.reset();
                        var redirection = response?.data?.redirection || response.data?.redirect_sent;
                        if (redirection && redirection.url) {
                            if (redirection.is_external) {
                                window.open(redirection.url, '_blank', 'noopener,noreferrer');
                            } else {
                                window.location.href = redirection.url;
                            }
                        }
                    } else {
                        displayMessage(messages.formError.replace('%error%', response?.data?.message || ''), 'error');
                    }
                },
                error: function (xhr, status, error) {
                    displayMessage(messages.serverError.replace('%error%', error), 'error');
                },
                complete: function () {
                    isSubmitting = false;
                }
            });
        };

        var showFieldError = function (input, message) {
            clearFieldError(input);
        
            var label = '';
            var fieldWrapper = input.closest('.tpaep-form-field');
            if (fieldWrapper) {
                var labelElement = fieldWrapper.querySelector('label');
                if (labelElement) {
                    label = labelElement.textContent.replace(/\*/g, '').trim();
                }
            }
        
            if (label) {
                message = label + ' ' + message;
            }
        
            var errorSpan = document.createElement('span');
            errorSpan.className = 'tpaep-field-error';
            // errorSpan.style.color = 'red';
            errorSpan.textContent = message;
        
            // If it's part of a checkbox or radio group, append error after fieldset
            var fieldset = input.closest('.tpaep-radio-checkbox');
            if (fieldset && fieldWrapper) {
                fieldWrapper.appendChild(errorSpan);
            } else {
                input.parentElement.appendChild(errorSpan);
            }
        };
        

        var clearFieldError = function (input) {
            var existingError = input.parentElement.querySelector('.tpaep-field-error');
            if (existingError) existingError.remove();
        };

        var clearMessages = function () {
            form.querySelectorAll('.tpaep-form-message').forEach(el => el.remove());
        };

        var messageTimeout;
        var displayMessage = function (message, type) {
            clearMessages();

            var messageDiv = document.createElement('div');
            messageDiv.className = 'tpaep-form-message ' + type;
            messageDiv.textContent = message;

            form.appendChild(messageDiv);

            clearTimeout(messageTimeout);
            messageTimeout = setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        };

        var countryCodes = [
            { code: "+44", name: "UK (+44)" },
            { code: "+1", name: "USA / Canada (+1)" },
            { code: "+213", name: "Algeria (+213)" },
            { code: "+376", name: "Andorra (+376)" },
            { code: "+244", name: "Angola (+244)" },
            { code: "+1264", name: "Anguilla (+1264)" },
            { code: "+1268", name: "Antigua & Barbuda (+1268)" },
            { code: "+54", name: "Argentina (+54)" },
            { code: "+374", name: "Armenia (+374)" },
            { code: "+297", name: "Aruba (+297)" },
            { code: "+61", name: "Australia (+61)" },
            { code: "+43", name: "Austria (+43)" },
            { code: "+994", name: "Azerbaijan (+994)" },
            { code: "+1242", name: "Bahamas (+1242)" },
            { code: "+973", name: "Bahrain (+973)" },
            { code: "+880", name: "Bangladesh (+880)" },
            { code: "+1246", name: "Barbados (+1246)" },
            { code: "+375", name: "Belarus (+375)" },
            { code: "+32", name: "Belgium (+32)" },
            { code: "+501", name: "Belize (+501)" },
            { code: "+229", name: "Benin (+229)" },
            { code: "+1441", name: "Bermuda (+1441)" },
            { code: "+975", name: "Bhutan (+975)" },
            { code: "+591", name: "Bolivia (+591)" },
            { code: "+387", name: "Bosnia Herzegovina (+387)" },
            { code: "+267", name: "Botswana (+267)" },
            { code: "+55", name: "Brazil (+55)" },
            { code: "+673", name: "Brunei (+673)" },
            { code: "+359", name: "Bulgaria (+359)" },
            { code: "+226", name: "Burkina Faso (+226)" },
            { code: "+257", name: "Burundi (+257)" },
            { code: "+855", name: "Cambodia (+855)" },
            { code: "+237", name: "Cameroon (+237)" },
            { code: "+238", name: "Cape Verde Islands (+238)" },
            { code: "+1345", name: "Cayman Islands (+1345)" },
            { code: "+236", name: "Central African Republic (+236)" },
            { code: "+56", name: "Chile (+56)" },
            { code: "+86", name: "China (+86)" },
            { code: "+57", name: "Colombia (+57)" },
            { code: "+269", name: "Comoros (+269)" },
            { code: "+242", name: "Congo (+242)" },
            { code: "+682", name: "Cook Islands (+682)" },
            { code: "+506", name: "Costa Rica (+506)" },
            { code: "+385", name: "Croatia (+385)" },
            { code: "+53", name: "Cuba (+53)" },
            { code: "+90392", name: "Cyprus North (+90392)" },
            { code: "+357", name: "Cyprus South (+357)" },
            { code: "+42", name: "Czech Republic (+42)" },
            { code: "+45", name: "Denmark (+45)" },
            { code: "+253", name: "Djibouti (+253)" },
            { code: "+1809", name: "Dominican Republic (+1809)" },
            { code: "+593", name: "Ecuador (+593)" },
            { code: "+20", name: "Egypt (+20)" },
            { code: "+503", name: "El Salvador (+503)" },
            { code: "+240", name: "Equatorial Guinea (+240)" },
            { code: "+291", name: "Eritrea (+291)" },
            { code: "+372", name: "Estonia (+372)" },
            { code: "+251", name: "Ethiopia (+251)" },
            { code: "+500", name: "Falkland Islands (+500)" },
            { code: "+298", name: "Faroe Islands (+298)" },
            { code: "+679", name: "Fiji (+679)" },
            { code: "+358", name: "Finland (+358)" },
            { code: "+33", name: "France (+33)" },
            { code: "+594", name: "French Guiana (+594)" },
            { code: "+689", name: "French Polynesia (+689)" },
            { code: "+241", name: "Gabon (+241)" },
            { code: "+220", name: "Gambia (+220)" },
            { code: "+7880", name: "Georgia (+7880)" },
            { code: "+49", name: "Germany (+49)" },
            { code: "+233", name: "Ghana (+233)" },
            { code: "+350", name: "Gibraltar (+350)" },
            { code: "+30", name: "Greece (+30)" },
            { code: "+299", name: "Greenland (+299)" },
            { code: "+1473", name: "Grenada (+1473)" },
            { code: "+590", name: "Guadeloupe (+590)" },
            { code: "+671", name: "Guam (+671)" },
            { code: "+502", name: "Guatemala (+502)" },
            { code: "+224", name: "Guinea (+224)" },
            { code: "+245", name: "Guinea - Bissau (+245)" },
            { code: "+592", name: "Guyana (+592)" },
            { code: "+509", name: "Haiti (+509)" },
            { code: "+504", name: "Honduras (+504)" },
            { code: "+852", name: "Hong Kong (+852)" },
            { code: "+36", name: "Hungary (+36)" },
            { code: "+354", name: "Iceland (+354)" },
            { code: "+91", name: "India (+91)" },
            { code: "+62", name: "Indonesia (+62)" },
            { code: "+98", name: "Iran (+98)" },
            { code: "+964", name: "Iraq (+964)" },
            { code: "+353", name: "Ireland (+353)" },
            { code: "+972", name: "Israel (+972)" },
            { code: "+39", name: "Italy (+39)" },
            { code: "+1876", name: "Jamaica (+1876)" },
            { code: "+81", name: "Japan (+81)" },
            { code: "+962", name: "Jordan (+962)" },
            { code: "+7", name: "Kazakhstan (+7)" },
            { code: "+254", name: "Kenya (+254)" },
            { code: "+686", name: "Kiribati (+686)" },
            { code: "+850", name: "Korea North (+850)" },
            { code: "+82", name: "Korea South (+82)" },
            { code: "+965", name: "Kuwait (+965)" },
            { code: "+996", name: "Kyrgyzstan (+996)" },
            { code: "+856", name: "Laos (+856)" },
            { code: "+371", name: "Latvia (+371)" },
            { code: "+961", name: "Lebanon (+961)" },
            { code: "+266", name: "Lesotho (+266)" },
            { code: "+231", name: "Liberia (+231)" },
            { code: "+218", name: "Libya (+218)" },
            { code: "+417", name: "Liechtenstein (+417)" },
            { code: "+370", name: "Lithuania (+370)" },
            { code: "+352", name: "Luxembourg (+352)" },
            { code: "+853", name: "Macao (+853)" },
            { code: "+389", name: "Macedonia (+389)" },
            { code: "+261", name: "Madagascar (+261)" },
            { code: "+265", name: "Malawi (+265)" },
            { code: "+60", name: "Malaysia (+60)" },
            { code: "+960", name: "Maldives (+960)" },
            { code: "+223", name: "Mali (+223)" },
            { code: "+356", name: "Malta (+356)" },
            { code: "+692", name: "Marshall Islands (+692)" },
            { code: "+596", name: "Martinique (+596)" },
            { code: "+222", name: "Mauritania (+222)" },
            { code: "+269", name: "Mayotte (+269)" },
            { code: "+52", name: "Mexico (+52)" },
            { code: "+691", name: "Micronesia (+691)" },
            { code: "+373", name: "Moldova (+373)" },
            { code: "+377", name: "Monaco (+377)" },
            { code: "+976", name: "Mongolia (+976)" },
            { code: "+1664", name: "Montserrat (+1664)" },
            { code: "+212", name: "Morocco (+212)" },
            { code: "+258", name: "Mozambique (+258)" },
            { code: "+95", name: "Myanmar (+95)" },
            { code: "+264", name: "Namibia (+264)" },
            { code: "+674", name: "Nauru (+674)" },
            { code: "+977", name: "Nepal (+977)" },
            { code: "+31", name: "Netherlands (+31)" },
            { code: "+687", name: "New Caledonia (+687)" },
            { code: "+64", name: "New Zealand (+64)" },
            { code: "+505", name: "Nicaragua (+505)" },
            { code: "+227", name: "Niger (+227)" },
            { code: "+234", name: "Nigeria (+234)" },
            { code: "+683", name: "Niue (+683)" },
            { code: "+672", name: "Norfolk Islands (+672)" },
            { code: "+670", name: "Northern Marianas (+670)" },
            { code: "+47", name: "Norway (+47)" },
            { code: "+968", name: "Oman (+968)" },
            { code: "+92", name: "Pakistan (+92)" },
            { code: "+680", name: "Palau (+680)" },
            { code: "+507", name: "Panama (+507)" },
            { code: "+675", name: "Papua New Guinea (+675)" },
            { code: "+595", name: "Paraguay (+595)" },
            { code: "+51", name: "Peru (+51)" },
            { code: "+63", name: "Philippines (+63)" },
            { code: "+48", name: "Poland (+48)" },
            { code: "+351", name: "Portugal (+351)" },
            { code: "+1787", name: "Puerto Rico (+1787)" },
            { code: "+974", name: "Qatar (+974)" },
            { code: "+262", name: "Reunion (+262)" },
            { code: "+40", name: "Romania (+40)" },
            { code: "+7", name: "Russia (+7)" },
            { code: "+250", name: "Rwanda (+250)" },
            { code: "+378", name: "San Marino (+378)" },
            { code: "+239", name: "Sao Tome & Principe (+239)" },
            { code: "+966", name: "Saudi Arabia (+966)" },
            { code: "+221", name: "Senegal (+221)" },
            { code: "+381", name: "Serbia (+381)" },
            { code: "+248", name: "Seychelles (+248)" },
            { code: "+232", name: "Sierra Leone (+232)" },
            { code: "+65", name: "Singapore (+65)" },
            { code: "+421", name: "Slovak Republic (+421)" },
            { code: "+386", name: "Slovenia (+386)" },
            { code: "+677", name: "Solomon Islands (+677)" },
            { code: "+252", name: "Somalia (+252)" },
            { code: "+27", name: "South Africa (+27)" },
            { code: "+34", name: "Spain (+34)" },
            { code: "+94", name: "Sri Lanka (+94)" },
            { code: "+290", name: "St. Helena (+290)" },
            { code: "+1869", name: "St. Kitts (+1869)" },
            { code: "+1758", name: "St. Lucia (+1758)" },
            { code: "+249", name: "Sudan (+249)" },
            { code: "+597", name: "Suriname (+597)" },
            { code: "+268", name: "Swaziland (+268)" },
            { code: "+46", name: "Sweden (+46)" },
            { code: "+41", name: "Switzerland (+41)" },
            { code: "+963", name: "Syria (+963)" },
            { code: "+886", name: "Taiwan (+886)" },
            { code: "+7", name: "Tajikstan (+7)" },
            { code: "+66", name: "Thailand (+66)" },
            { code: "+228", name: "Togo (+228)" },
            { code: "+676", name: "Tonga (+676)" },
            { code: "+1868", name: "Trinidad & Tobago (+1868)" },
            { code: "+216", name: "Tunisia (+216)" },
            { code: "+90", name: "Turkey (+90)" },
            { code: "+7", name: "Turkmenistan (+7)" },
            { code: "+993", name: "Turkmenistan (+993)" },
            { code: "+1649", name: "Turks & Caicos Islands (+1649)" },
            { code: "+688", name: "Tuvalu (+688)" },
            { code: "+256", name: "Uganda (+256)" },
            { code: "+380", name: "Ukraine (+380)" },
            { code: "+971", name: "United Arab Emirates (+971)" },
            { code: "+598", name: "Uruguay (+598)" },
            { code: "+7", name: "Uzbekistan (+7)" },
            { code: "+678", name: "Vanuatu (+678)" },
            { code: "+379", name: "Vatican City (+379)" },
            { code: "+58", name: "Venezuela (+58)" },
            { code: "+84", name: "Vietnam (+84)" },
            { code: "+84", name: "Virgin Islands - British (+1284)" },
            { code: "+84", name: "Virgin Islands - US (+1340)" },
            { code: "+681", name: "Wallis & Futuna (+681)" },
            { code: "+969", name: "Yemen (North)(+969)" },
            { code: "+967", name: "Yemen (South)(+967)" },
            { code: "+260", name: "Zambia (+260)" },
            { code: "+263", name: "Zimbabwe (+263)" },
        ];
    
        const $select = $('.tpaep-phone-country-code');
        if (!$select.length) return;
    
        $select.html('<option value="">Code</option>');
    
        countryCodes.forEach(function (country) {
            const $option = $('<option></option>')
            .val(country.code)
            .text(country.name);
            $select.append($option);
        });

    };

    window.addEventListener('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction('frontend/element_ready/tp-plus-form.default', WidgetFormHandler);
    });

})(jQuery);

