/* PLEASE DO NOT COPY AND PASTE THIS CODE. */
(
    function installFormleads() {
        var version = "1.0.4";
        var apiUrl = "https://formsleads.com/staging/portal/api/Form_data";
        var postUrl = "https://formsleads.com/staging/portal/api/Addlead";
        var recaptchaURL = "https://www.recaptcha.net/recaptcha/enterprise.js?onload=onRecaptchaLoadCallback&render=explicit";
        var recaptchaSiteKey = "6Ld9h6cgAAAAAHWk24MkMs-N8JMASQIC-tG7oTMK";
        var recaptchaScriptID = "google-recaptcha";
        var scriptName = "formsleads.min.js";
        var cssId = 'formsleads.min.css';
        var flCssUrl = "https://cdn.jsdelivr.net/gh/ivsmani/formsleads@" + version + "/source/formsleads.min.css";

        function domReady(fn) {
            // see if DOM is already available
            if (document.readyState === "complete" || document.readyState === "interactive") {
                // call on next available tick
                setTimeout(fn, 1);
            } else {
                document.addEventListener("DOMContentLoaded", fn);
            }
        }

        // Extract "GET" parameters from a JS include querystring
        function getParams() {
            // Find all script tags
            var scripts = document.getElementsByTagName("script");
            
            // Look through them trying to find our script
            for(var i=0; i<scripts.length; i++) {
                if(scripts[i].src.indexOf("/" + scriptName) > -1) {
                    // Get an array of key=value strings of params
                    var pa = scripts[i].src.split("?").pop().split("&");
            
                    // Split each key=value into array, the construct js object
                    var p = {};

                    for(var j=0; j<pa.length; j++) {
                        var kv = pa[j].split("=");
                        p[kv[0]] = kv[1];
                    }

                    return p;
                }
            }
            
            // No scripts match
            return {};
        }

        function addRecaptchaScript(rcWrapper, rcWidget) {
            // Find all script tags
            var scripts = document.getElementsByTagName("script");
            var noScriptFound = true;

            for(var j=0; j<scripts.length; j++) {
                if (scripts[j]["id"] === recaptchaScriptID) {
                    noScriptFound = false;
                }
            }

            if (noScriptFound) {
                var head  = document.getElementsByTagName('head')[0];
                var scriptEl  = document.createElement('script');
                scriptEl.id   = recaptchaScriptID;
                scriptEl.src = recaptchaURL;
                scriptEl.async = true;
                scriptEl.defer = true;
                head.appendChild(scriptEl);

                window.onRecaptchaLoadCallback = function() {
                    rcWidget(grecaptcha.enterprise.render(rcWrapper, { sitekey: recaptchaSiteKey }));
                };
            } else {
                // for more form recaptcha widgets goes here...
                var grecaptchaInterval = setInterval(function() {
                    if (grecaptcha) {
                        rcWidget(grecaptcha.enterprise.render(rcWrapper, { sitekey: recaptchaSiteKey }));
                        clearInterval(grecaptchaInterval);
                    }
                }, 500);
            }

        }

        function injectCSS() {
            if (!document.getElementById(cssId))
            {
                var head  = document.getElementsByTagName('head')[0];
                var link  = document.createElement('link');
                link.id   = cssId;
                link.rel  = 'stylesheet';
                link.type = 'text/css';
                link.href = flCssUrl;
                link.media = 'all';
                head.appendChild(link);
            }
        }

        function onInputValueChange(successEl, errorEl) {
            return function () {
                successEl.innerHTML = "";
                errorEl.innerHTML = "";
            };
        }

        function makeItAHiddenField(fieldEl, value) {
            fieldEl.type = 'hidden';
            fieldEl.value = value;
        }

        function createFormInput(details, successEl, errorEl, cs, hiddenF) {
            var basicType = ['text', 'email', 'number'].includes(details.type);
            var inputWrapper = document.createElement("div");

            if (!hiddenF) {
                inputWrapper.classList.add("formsleads-form__input-wrapper");
            }

            if (cs.fieldWrapper) {
                inputWrapper.style = cs.fieldWrapper;
            }


            if (basicType) {
                var inputElement = document.createElement("input");
                
                inputElement.classList.add("other__input");
                
                if (cs.input) {
                    inputElement.style = cs.input;
                }
                
                inputElement.type = details.type;
                inputElement.placeholder = details.placeholder;
                inputElement.name = details.field_name;
                inputElement.required = Boolean(details.is_required);
                inputElement.onkeydown = onInputValueChange(successEl, errorEl);
                
                if (hiddenF) {
                    makeItAHiddenField(inputElement, hiddenF.value);
                }

                var labelElement = document.createElement("label");
                labelElement.innerHTML = details.label;
                if (cs.label) {
                    labelElement.style = cs.label;
                }

                inputWrapper.appendChild(inputElement);

                if (!hiddenF) {
                    inputWrapper.appendChild(labelElement);
                }
            } else if (details.type === "select") {
                var selectElement = document.createElement("select");

                if (cs.select) {
                    selectElement.style = cs.select;
                }

                selectElement.name = details.field_name;
                selectElement.required = Boolean(details.is_required);
                selectElement.onchange = onInputValueChange(successEl, errorEl);

                var firstOption = document.createElement("option");
                firstOption.value = "";
                firstOption.innerHTML = "Select a " + details.label;
                selectElement.appendChild(firstOption);

                if (hiddenF) {
                    makeItAHiddenField(selectElement, hiddenF.value);
                }

                details.options.forEach(function (option, op) {
                    var optionElement = document.createElement("option");
                    optionElement.innerHTML = option;
                    optionElement.value = option;

                    selectElement.appendChild(optionElement);

                });

                var labelElement = document.createElement("label");
                labelElement.innerHTML = details.label;

                if (cs.label) {
                    labelElement.style = cs.label;
                }
                
                inputWrapper.appendChild(selectElement);
                if (!hiddenF) {
                    inputWrapper.appendChild(labelElement);
                }
            } else if (['radio', 'checkbox'].includes(details.type)) {
                inputWrapper.classList.remove("formsleads-form__input-wrapper");
                inputWrapper.classList.add("formsleads-form__radio-wrapper");

                var radioWrapper = document.createElement("div");
                
                details.options.every(function (option, r) {
                    var radioContainer = document.createElement("div");
                    radioContainer.classList.add("formsleads-form__radio-container");

                    var radioElement = document.createElement("input");
                    radioElement.classList.add("radio__input");
                    radioElement.id = "fl-radio" + r;
                    if (r === 0 && details.type === "radio") {
                        radioElement.required = Boolean(details.is_required);
                    }

                    var radioLabel = document.createElement("label");
                    radioElement.type = details.type;
                    radioElement.value = option;
                    radioElement.name = details.field_name + "[]";
                    radioElement.placeholder = details.placeholder;
                    radioElement.onchange = onInputValueChange(successEl, errorEl);

                    if (hiddenF) {
                        makeItAHiddenField(radioElement, hiddenF.value);
                    }

                    radioLabel.innerHTML = option;
                    radioLabel.htmlFor = "fl-radio" + r;

                    radioContainer.appendChild(radioElement);
                    if (!hiddenF) {
                        radioContainer.appendChild(radioLabel);
                    }
                    radioWrapper.appendChild(radioContainer);

                    return !hiddenF;
                });

                var labelElement = document.createElement("label");
                labelElement.classList.add("formsleads-check-radio-title");
                
                if (cs.label) {
                    labelElement.style = cs.label;
                }
                
                labelElement.innerHTML = details.label;

                if (!hiddenF) {
                    inputWrapper.appendChild(labelElement);
                }
                
                inputWrapper.appendChild(radioWrapper);
            }
            
            return inputWrapper;
        }

        async function fetchFormData(appKey, notch) {
            return await fetch(apiUrl + '?appkey=' + appKey + '&notch=' + notch)
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }

                throw new Error({ message: 'Something went wrong' });
            })
            .catch((err) => Promise.reject(err));
        }

        function addRecaptcha(rc, wrapper, rcWidget) {
            if (rc == 1) {
                return addRecaptchaScript(wrapper, rcWidget);
            }
        }

        function onFormsLeadsFormSubmit(args, rc, errorEl, successEl, submitBtn, formEle) {
            return function (e) {
                var captchaToken = true;

                if (rc == 1) {
                    captchaToken = grecaptcha && grecaptcha.enterprise && grecaptcha.enterprise.getResponse(window.renderedRCWidget[args.notch]) || null;
                }

                if (captchaToken) {
                    submitBtn.disabled = true;
                    formEle.classList.add("disable-formsleads-form");

                    var formData = new FormData(e.target);
                    formData.append("notch", args.notch);
    
                    var xmlHttp = new XMLHttpRequest();
    
                    xmlHttp.onreadystatechange = function () {
                        if (xmlHttp.readyState == 4) {
                            submitBtn.disabled = false;
                            formEle.classList.remove("disable-formsleads-form");

                            if (xmlHttp.status == 200) {
                                const myObj = JSON.parse(xmlHttp.responseText);
        
                                if (myObj.status == 1) {
                                    formEle.reset();
                                    if (grecaptcha) {
                                        grecaptcha.reset(window.renderedRCWidget[args.notch]);
                                    }

                                    if (args.afterSubmit && typeof args.afterSubmit == "function") {
                                        args.afterSubmit();
                                    }
                                    successEl.innerHTML = args.successText || myObj.suc_message;
                                } else {
                                    errorEl.innerHTML = myObj.error_message;
                                }
                            }
                        }
                    };
                    
                    xmlHttp.open("post", postUrl);
                    xmlHttp.send(formData);
                } else {
                    errorEl.innerHTML = "Recaptcha error. Please check the recaptcha box."
                }

                
                return false;
            }
        }

        function createTextElement(text, textStyle, formElement) {
            if (!!text) {
                var textElement = document.createElement('div');
                textElement.classList.add("formsleads-form-text-element");
                textElement.innerHTML = text;
    
                if (textStyle) {
                    textElement.style = textStyle;
                }
    
                formElement.appendChild(textElement);
            }
        }

        window.formsleads = {
            params: getParams(),
            render: function (args) {
                let fldsRipple = null;
                let formContainer = null;
                const customStyle = args.customStyle || {};
                const texts = args.text || {};

                domReady(function() {
                    injectCSS();
                    formContainer = document.getElementById(args.wrapperId);

                    // initial Loader implementation 
                    fldsRipple = document.createElement('div');
                    fldsRipple.classList.add('flds-ripple');
                    var rippleOne = document.createElement('div');
                    var rippleTwo = document.createElement('div');
                    fldsRipple.appendChild(rippleOne);
                    fldsRipple.appendChild(rippleTwo);

                    formContainer.appendChild(fldsRipple);
                });

                fetchFormData(formsleads.params["app-key"], args.notch).then(function(res) {
                    // Form can be rendered only if the API is successful...
                    domReady(function() {
                        // DOM is loaded and ready for manipulation here
                        formContainer = formContainer || document.getElementById(args.wrapperId);

                        if (fldsRipple) {
                            formContainer.removeChild(fldsRipple);
                            fldsRipple = null;
                        }

                        // Creating and adding Form Title elements
                        var formTitleContainer = document.createElement("div");
                        var formTitle = document.createElement("h4");
                        formTitle.innerHTML = args.formTitle || res.title || "Form";
                        formTitle.classList.add("formsleads-formtitle");
                        
                        if (customStyle.formTitle) {
                            formTitle.style = customStyle.formTitle;
                        }

                        formTitleContainer.appendChild(formTitle);
                        formContainer.appendChild(formTitleContainer);

                        // Creating and adding form element
                        var formElement = document.createElement("form");
                        formElement.classList.add("formsleads-form");

                        if (customStyle.form) {
                            formElement.style = customStyle.form;
                        }

                        formElement.id = "formsleads-form";
                        formContainer.appendChild(formElement);

                        var successElement = document.createElement("div");
                        successElement.classList.add('formsleads-success-msg');
                        
                        var errorElement = document.createElement("div");
                        errorElement.classList.add('formsleads-error-msg');

                        // Text below title
                        createTextElement(texts.belowTitle, customStyle.belowTitleText, formElement);

                        // Creating and adding form inputs
                        res.fields.forEach(function (formInput, fieldIndex) {
                            var hiddenField = (args.hiddenFields || []).find(function (hf) { return hf.index == (fieldIndex + 1) });
                            var eleToAppend = createFormInput(formInput, successElement, errorElement, customStyle, hiddenField);
                            formElement.appendChild(eleToAppend);
                        });

                        window.renderedRCWidget = window.renderedRCWidget || {};

                        rcWidget = function(widget) {
                            window.renderedRCWidget[args.notch] = widget;
                        }

                        var recaptchaWrapper = document.createElement("div");
                        recaptchaWrapper.classList.add("formsleads-recaptcha-wrapper");
                        if (customStyle.recaptchaWrapper) {
                            recaptchaWrapper.style = customStyle.recaptchaWrapper;
                        }
                        
                        // Text above recaptcha
                        createTextElement(texts.aboveRecaptcha, customStyle.aboveRecaptchaText, formElement);

                        formElement.appendChild(recaptchaWrapper);
                        var rcWidget = addRecaptcha(res.recaptcha, recaptchaWrapper, rcWidget);

                        var messageContainer = document.createElement("div");
                        formElement.appendChild(messageContainer);
                        
                        messageContainer.appendChild(successElement);
                        messageContainer.appendChild(errorElement);

                        var submitBtnWrapper = document.createElement("div");
                        submitBtnWrapper.classList.add("formsleads-form-submit-btn-wrapper");

                        if (customStyle.buttonWrapper) {
                            submitBtnWrapper.style = customStyle.buttonWrapper;
                        }
                        
                        var formsleadsBtn = document.createElement("input");
                        formsleadsBtn.type = "submit";
                        formsleadsBtn.classList.add("formsleads-form-submit-btn");

                        if (customStyle.button) {
                            formsleadsBtn.style = customStyle.button;
                        }

                        formsleadsBtn.value = args.buttonText || "Submit";
                        submitBtnWrapper.appendChild(formsleadsBtn);

                        // Text above Submit button
                        createTextElement(texts.aboveSubmit, customStyle.aboveSubmitText, formElement);

                        formElement.appendChild(submitBtnWrapper);

                        // Text below Submit button
                        createTextElement(texts.belowSubmit, customStyle.belowSubmitText, formElement);

                        formElement.onsubmit = onFormsLeadsFormSubmit(args, res.recaptcha, errorElement, successElement, formsleadsBtn, formElement);
                    });
                }).catch(function() {
                    console.error("error in appKey");
                    domReady(function() {
                        injectCSS();
                        formContainer = document.getElementById(args.wrapperId);
                        
                        if (fldsRipple) {
                            formContainer.removeChild(fldsRipple);
                            fldsRipple = null;
                        }
                        var formError = document.createElement("div");
                        formError.classList.add("formsleads-error-msg");
                        formError.innerHTML = "Error loading the form.";
                        formContainer.appendChild(formError);
                    });
                });
            }
        }
    }
)();