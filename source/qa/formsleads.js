/* PLEASE DO NOT COPY AND PASTE THIS CODE. */
(
    function installFormleads() {
        var version = "1.2.9";
        var apiUrl = "https://formsleads.com/staging/portal/api/Form_data";
        var postUrl = "https://formsleads.com/staging/portal/api/Addlead";
        var recaptchaURL = "https://www.recaptcha.net/recaptcha/enterprise.js?onload=onRecaptchaLoadCallback&render=explicit";
        var recaptchaSiteKey = "6Ld9h6cgAAAAAHWk24MkMs-N8JMASQIC-tG7oTMK";
        var recaptchaScriptID = "google-recaptcha";
        var scriptName = "formsleads.min.js";
        var cssId = 'formsleads.min.css';
        var flCssUrl = "https://cdn.jsdelivr.net/gh/ivsmani/formsleads@" + version + "/source/formsleads.min.css";
        // var flCssUrl = "/source/formsleads.css";
        var usPhonePattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        var phoneWarningMsg = "Please enter a valid phone number.";

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

        function addRecaptchaScript(rcWrapper, rcWidget, callback) {
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
                    rcWidget(grecaptcha.enterprise.render(rcWrapper, { sitekey: recaptchaSiteKey, callback }));
                };
            } else {
                // for more form recaptcha widgets goes here...
                var grecaptchaInterval = setInterval(function() {
                    if (grecaptcha) {
                        rcWidget(grecaptcha.enterprise.render(rcWrapper, { sitekey: recaptchaSiteKey, callback }));
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

        // Phone number formating 123-456-7890
        function formatPhoneNumber(value) {
            if (!value) return value;

            const phoneNumber = value.replace(/[^\d]/g, '');
            const phoneNumberLength = phoneNumber.length;
            
            if (phoneNumberLength < 4) return phoneNumber;
            
            if (phoneNumberLength < 7) {
              return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
            }

            return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        }

        function getFormatField(formatList, fieldIndex) {
            return formatList.find(fl => fl.index == fieldIndex);
        }

        function setInputValueFormated(element, formatItem) {
            if (formatItem.type == "us-phone") {
                element.value = formatPhoneNumber(element.value);
            } else if (formatItem.type == "custom") {

                if (typeof formatItem.onChange == "function") {
                    element.value = formatItem.onChange(element.value);
                }
            }

        }

        function addValidationOrFormatToInput(fieldIndex, element, validationlist = [], formatList = []) {
            const targetedFormatInputs = formatList.filter(fl => !validationlist.filter(vl => vl.index == fl.index).length && fl.index === fieldIndex);

            if (targetedFormatInputs.length) {
                element.oninput = function () {
                    setInputValueFormated(element, targetedFormatInputs[0]);
                }
            }

            validationlist.forEach(function (listItem) {
                if (listItem.index === fieldIndex) {
                    if (listItem.type === "phone") {
                        const targetedFormatInput = getFormatField(formatList, fieldIndex);

                        element.oninput = function () {
                            if (targetedFormatInput) {
                                setInputValueFormated(element, targetedFormatInput);
                            }

                            if (!usPhonePattern.test(element.value)) {
                                element.setCustomValidity(listItem.message || phoneWarningMsg);

                                if (!listItem.onsubmit) {
                                    element.reportValidity();
                                }
                            } else {
                                element.setCustomValidity('');
                            }
                        }
                    } else {
                        element.oninput = function () {
                            if (getFormatField(formatList, fieldIndex)) {
                                element.value = formatPhoneNumber(element.value);
                            }

                                if (listItem.regex && !listItem.regex.test(element.value) && !listItem.onblur) {
                                    element.setCustomValidity(listItem.message)
                                    if (!listItem.onsubmit) {
                                        element.reportValidity();
                                    }
                                } else {
                                    element.setCustomValidity('');
                                }
                        }
                        
                        if (listItem.onblur) {
                            element.onblur = function () {
                                if (listItem.regex && !listItem.regex.test(element.value)) {
                                    element.setCustomValidity(listItem.message)
                                    if (!listItem.onsubmit) {
                                        element.reportValidity();
                                    }
                                } else {
                                    element.setCustomValidity('');
                                }
                            }
                        }
                    }
                }
            });
        }

        function makeItAHiddenField(fieldEl, value, wrapper) {
            fieldEl.type = 'hidden';
            fieldEl.value = value || '';
            fieldEl.required = false;

            if (wrapper) {
                wrapper.style.display = "none";
            }
        }

        function addCSSinHead(className, styles) {
            if (!(window.formsleadsStyleTags && window.formsleadsStyleTags.includes(className))) {
                var css = className + ' { ' + styles +' }';
                var style = document.createElement('style');
                style.appendChild(document.createTextNode(css));
                document.getElementsByTagName('head')[0].appendChild(style);
                
                if (window.formsleadsStyleTags) {
                    window.formsleadsStyleTags.push(className);
                } else {
                    window.formsleadsStyleTags = [className];
                }
            }
        }

        function resetAllDropDowns(formKey) {
            const dropdownList = window.formsleadsFormDropdownList && window.formsleadsFormDropdownList[formKey] || [];
            
            dropdownList.forEach(function (ddReset) {
                if (typeof ddReset == "function") {
                    ddReset();
                }
            });
        }

        function addResetToWindow(resetFunc, formKey) {
            if (window.formsleadsFormDropdownList) {
                if (window.formsleadsFormDropdownList[formKey]) {
                    window.formsleadsFormDropdownList[formKey].push(resetFunc);
                } else {
                    window.formsleadsFormDropdownList[formKey] = [resetFunc];
                }
            } else {
                window.formsleadsFormDropdownList = {};
                window.formsleadsFormDropdownList[formKey] = [resetFunc];
            }
        }

        function createCustomDropdown(options, label, selectEl, cs, formKey, onChange) {
            var customStyle = cs.dropdown || {};
            var defaultValue = "Select " + (['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'].includes(label.charAt(0)) ? "an " : "a ") + label;
            var dropdownWrapper = document.createElement("div");
            dropdownWrapper.classList.add("prevent-select");
            dropdownWrapper.style.zIndex = 10;
            dropdownWrapper.style = customStyle.wrapper || "";
            dropdownWrapper.tabIndex = 0;

            var selectDivStyle = customStyle.placeholder || customStyle.select || "";
            
            var selectDiv = document.createElement("div");
            selectDiv.classList.add("formsleads-form-dropdown");
            selectDiv.innerHTML = defaultValue;
            selectDiv.style = selectDivStyle;

            var dropdownList = document.createElement("ul");
            dropdownList.classList.add("formsleads-form-dropdown-ul");
            dropdownList.style = customStyle.list || "";

            // Outside click handling
            dropdownWrapper.onblur = function () {
                dropdownList.style.display = "none";
            }
            // -------------------------------------------
            
            selectDiv.onclick = function (e) {
                e.stopPropagation();
                dropdownList.style.display = dropdownList.style.display === "block" ? "none" : "block";
            }

            var firstOption = document.createElement("li");
            firstOption.classList.add("formsleads-form-dropdown-firstitem");
            firstOption.innerHTML = defaultValue;
            firstOption.style = customStyle.firstOption || "";
            dropdownList.appendChild(firstOption);
            firstOption.onclick = function () {
                selectDiv.innerHTML = defaultValue;
                dropdownList.style.display = "none";
                selectEl.selectedIndex = 0;
                selectDiv.style = selectDivStyle;
                onChange();
            }

            addResetToWindow(function resetDropdown() {
                selectDiv.innerHTML = defaultValue;
            }, formKey);

            
            options.forEach(function (opt, index) {
                var optionEl = document.createElement("li");
                optionEl.classList.add("formsleads-form-dropdown-item");
                optionEl.innerHTML = opt;
                optionEl.style = customStyle.option;
                optionEl.onclick = function () {
                    selectDiv.innerHTML = opt;
                    selectDiv.style = customStyle.select || "";
                    dropdownList.style.display = "none";
                    selectEl.selectedIndex = index + 1;
                    onChange();
                }

                dropdownList.appendChild(optionEl);
            });
            

            if (options.length > 0 && customStyle.optionHover) {
                addCSSinHead(".formsleads-form-dropdown-item:hover", customStyle.optionHover);
            }

            dropdownWrapper.appendChild(selectDiv);
            dropdownWrapper.appendChild(dropdownList);

            return dropdownWrapper;
        }

        function createFormInput(details, successEl, errorEl, cs, fieldIndex, hiddenF, validationList, customOptions, changeInput, hidePlaceholders, hideLabels, disableLabelAnimation, customDropdown, formKey, formatList) {
            var basicType = ['text', 'email', 'number'].includes(details.type);
            var inputWrapper = document.createElement("div");

            if (!hiddenF) {
                inputWrapper.classList.add("formsleads-form__input-wrapper");
            }

            if (cs.fieldWrapper) {
                inputWrapper.style = cs.fieldWrapper;
            }


            if (basicType) {
                var renderTextArea = changeInput && changeInput.to === "textarea";
                var inputElement = document.createElement(renderTextArea ? "textarea" : "input");
                
                inputElement.classList.add("other__input");
                
                if (renderTextArea) {
                    if (changeInput.styles) {
                        inputElement.style = changeInput.styles;
                    }
                } else if (cs.input) {
                    inputElement.style = cs.input;
                }

                if (cs.placeholder) {
                    addCSSinHead("input.other__input::placeholder", cs.placeholder);
                    addCSSinHead("textarea.other__input::placeholder", cs.placeholder);
                }
                
                inputElement.type = details.type;

                if (!hidePlaceholders) {
                    inputElement.placeholder = details.placeholder;
                }

                inputElement.name = details.field_name;
                inputElement.required = details.is_required == "true";
                inputElement.onkeydown = onInputValueChange(successEl, errorEl);

                addValidationOrFormatToInput(fieldIndex, inputElement, validationList, formatList);
                
                if (hiddenF) {
                    makeItAHiddenField(inputElement, hiddenF.value, inputWrapper);
                }

                var labelElement = document.createElement("label");
                labelElement.innerHTML = details.label;
                if (!disableLabelAnimation) {
                    labelElement.classList.add("formsleads-form__field-label");

                    if (renderTextArea) {
                        labelElement.classList.add("formsleads__textarea-label");
                    }
                }

                if (cs.label) {
                    labelElement.style = cs.label;
                }

                if (!hiddenF && !hideLabels && disableLabelAnimation) {
                    inputWrapper.appendChild(labelElement);
                }

                inputWrapper.appendChild(inputElement);

                if (!hiddenF && !hideLabels && !disableLabelAnimation) {
                    inputWrapper.appendChild(labelElement);
                }

            } else if (details.type === "select") {
                var selectElement = document.createElement("select");

                if (cs.select) {
                    selectElement.style = cs.select;
                }

                selectElement.name = details.field_name;
                selectElement.required = details.is_required == "true";
                selectElement.onchange = onInputValueChange(successEl, errorEl);

                var firstOption = document.createElement("option");
                firstOption.value = "";
                firstOption.innerHTML = "Select " + (['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'].includes(details.label.charAt(0)) ? "an " : "a ") + details.label;
                selectElement.appendChild(firstOption);

                if (hiddenF) {
                    selectElement.hidden = 'hidden';
                    makeItAHiddenField(selectElement, hiddenF.value, inputWrapper);
                }

                (customOptions.options || details.options).forEach(function (option, op) {
                    var optionElement = document.createElement("option");
                    optionElement.innerHTML = option;
                    optionElement.value = option;

                    if (hiddenF) {
                        optionElement.selected = option === hiddenF.value;
                    }

                    selectElement.appendChild(optionElement);

                });

                var labelElement = document.createElement("label");
                labelElement.innerHTML = details.label;

                if (!disableLabelAnimation) {
                    labelElement.classList.add("formsleads-form__field-label");
                }

                if (cs.label) {
                    labelElement.style = cs.label;
                }
                
                if (!hiddenF && !hideLabels && disableLabelAnimation) {
                    inputWrapper.appendChild(labelElement);
                }
                
                inputWrapper.appendChild(selectElement);

                if (!hiddenF && !hideLabels && !disableLabelAnimation) {
                    inputWrapper.appendChild(labelElement);
                }

                if (!hiddenF && customDropdown) {
                    selectElement.style.position = "absolute";
                    selectElement.style.zIndex = -1;
                    selectElement.style.opacity = 0;
                    inputWrapper.appendChild(createCustomDropdown(customOptions.options || details.options, details.label, selectElement, cs, formKey, onInputValueChange(successEl, errorEl)));
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
                        radioElement.required = details.is_required == "true";
                    }

                    var radioLabel = document.createElement("label");
                    radioElement.type = details.type;
                    radioElement.value = option;
                    radioElement.name = details.field_name + "[]";
                    radioElement.placeholder = details.placeholder;
                    radioElement.onchange = onInputValueChange(successEl, errorEl);

                    if (hiddenF) {
                        makeItAHiddenField(radioElement, hiddenF.value, inputWrapper);
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
                if (!disableLabelAnimation) {
                    labelElement.classList.add("formsleads-check-radio-title");
                }
                
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
            return await fetch(apiUrl + '?appKey=' + appKey + '&notch=' + notch)
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }

                throw new Error({ message: 'Something went wrong' });
            })
            .catch((err) => Promise.reject(err));
        }

        function addRecaptcha(rc, wrapper, rcWidget, callback) {
            if (rc) {
                return addRecaptchaScript(wrapper, rcWidget, callback);
            }
        }

        function restOfTheSubmit(eve, args, rc, errorEl, successEl, submitBtn, formEle) {
            var captchaToken = true;
            var e = eve ? eve : window.formsleadsRecaptchaEvent;
            var formKey = args.notch + "-" + args.wrapperId;


                if (rc) {
                    captchaToken = grecaptcha && grecaptcha.enterprise && grecaptcha.enterprise.getResponse(window.renderedRCWidget[formKey]) || null;
                }

                if (captchaToken) {
                    submitBtn.disabled = true;
                    formEle.classList.add("disable-formsleads-form");

                    var formData = new FormData(e.target);
                    var formDataObject = Object.fromEntries(formData.entries());

                    formData.append("notch", args.notch);

                    if (formsleads.forms[args.wrapperId]) {
                        var hiddenValues = formsleads.forms[args.wrapperId].values;
                        var hiddenValueKeys = Object.keys(hiddenValues);
                        var fieldsAvailable = formsleads.forms[args.wrapperId].fields;
                        if (hiddenValueKeys.length > 0) {
                            hiddenValueKeys.forEach(function (v) {
                                if (fieldsAvailable[v]) {
                                    formData.set(fieldsAvailable[v], hiddenValues[v] || '');
                                }
                            })
                        }
                    }

                    var xmlHttp = new XMLHttpRequest();
    
                    xmlHttp.onreadystatechange = function () {
                        if (xmlHttp.readyState == 4) {
                            submitBtn.disabled = false;
                            formEle.classList.remove("disable-formsleads-form");

                            if (xmlHttp.status == 200) {
                                const myObj = JSON.parse(xmlHttp.responseText);
        
                                if (myObj.status == 1) {
                                    if (args.afterSubmit && typeof args.afterSubmit == "function") {
                                        args.afterSubmit(formDataObject);
                                    }

                                    successEl.innerHTML = args.successText || myObj.suc_message;

                                    resetAllDropDowns(formKey);
                                    formEle.reset();
                                    
                                    if (window.grecaptcha) {
                                        grecaptcha.enterprise.reset(window.renderedRCWidget[formKey]);
                                    }
                                } else {
                                    if (args.errorSubmit && typeof args.errorSubmit == "function") {
                                        args.errorSubmit({ error: myObj.error_message });
                                    }

                                    errorEl.innerHTML = myObj.error_message;
                                }
                            }
                        }
                    };
                    
                    xmlHttp.open("post", postUrl + '?appKey=' + formsleads.params["app-key"]);
                    xmlHttp.send(formData);
                } else {
                    errorEl.innerHTML = "Recaptcha error. Please check the recaptcha box."
                }

        }

        function onFormsLeadsFormSubmit(args, rc, errorEl, successEl, submitBtn, formEle, popupDiv, outsidePopup) {
            return function (e) {
                e.preventDefault();
                if (popupDiv) {
                    popupDiv.style.display = "flex";
                    
                    if (outsidePopup) {
                        document.body.style.overflow = "hidden";
                    }
                    
                    window.formsleadsRecaptchaEvent = e;
                } else {
                    restOfTheSubmit(e, args, rc, errorEl, successEl, submitBtn, formEle);
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

        function setFormFieldValue(wrapperId, fieldIndex, value) {
            var fetchedForm = formsleads.forms[wrapperId];

            if (fetchedForm && fetchedForm.rendered) {
                formsleads.forms[wrapperId].values[fieldIndex] = value;
            }
        }

        window.formsleads = {
            params: getParams(),
            forms: {},
            setValue: setFormFieldValue,
            render: function (args) {
                let fldsRipple = null;
                let formContainer = null;
                const formKey = args.notch + "-" + args.wrapperId;
                const customStyle = args.customStyle || {};
                const texts = args.text || {};
                const hidePlaceholders = args.hidePlaceholders;
                const hideLabels = args.hideLabels;
                const disableLabelAnimation = args.disableLabelAnimation;
                const hideAllMessages = args.hideAllMessages;
                const hideSuccessMessage = args.hideSuccessMessage;
                const customDropdown = args.customDropdown;

                domReady(function() {
                    injectCSS();
                    formContainer = document.getElementById(args.wrapperId);

                    if (!formContainer) return;

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
                        var formFields = {};

                        if (!formContainer) return;

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

                        if (hideSuccessMessage) {
                            successElement.style.display = "none";
                        }
                        
                        var errorElement = document.createElement("div");
                        errorElement.classList.add('formsleads-error-msg');

                        // Text below title
                        createTextElement(texts.belowTitle, customStyle.belowTitleText, formElement);

                        // Creating and adding form inputs
                        res.fields.forEach(function (formInput, index) {
                            var hiddenField = (args.hiddenFields || []).find(function (hf) { return hf.index == (index + 1) });
                            var customOptions = (args.customOptions || []).find(function (co) { return co.index == (index + 1) }) || {};
                            var changeInput = (args.changeInput || []).find(function (ci) { return ci.index == (index + 1) });
                            var eleToAppend = createFormInput(formInput, successElement, errorElement, customStyle, index + 1, hiddenField, args.validate, customOptions, changeInput, hidePlaceholders, hideLabels, disableLabelAnimation, customDropdown, formKey, args.format);
                            formElement.appendChild(eleToAppend);
                            formFields[index + 1] = ['radio', 'checkbox'].includes(formInput.type) ? (formInput.field_name + "[]") : formInput.field_name;
                        });

                        window.renderedRCWidget = window.renderedRCWidget || {};

                        rcWidget = function(widget) {
                            window.renderedRCWidget[args.notch + "-" + args.wrapperId] = widget;
                        }

                        var formsleadsBtn = document.createElement("input");
                        formsleadsBtn.type = "submit";
                        formsleadsBtn.classList.add("formsleads-form-submit-btn");

                        if (customStyle.button) {
                            formsleadsBtn.style = customStyle.button;
                        }

                        formsleadsBtn.value = args.buttonText || "Submit";
                            
                        // Text above recaptcha
                        createTextElement(texts.aboveRecaptcha, customStyle.aboveRecaptchaText, formElement);

                        var recaptchaNeeded = res.recaptcha == 1;
                        var popupRecaptcha = ["inside", "outside"].includes(args.popupRecaptcha);
                        var popupDiv = recaptchaNeeded && popupRecaptcha ? document.createElement("div") : null;
                        var outsidePopup = recaptchaNeeded && args.popupRecaptcha === "outside";

                        function recaptchaCallback() {
                            if (popupDiv) {
                                restOfTheSubmit(null, args, recaptchaNeeded, errorElement, successElement, formsleadsBtn, formElement);
                                popupDiv.style.display = "none";
                                document.body.style.overflow = "auto";
                            }
                        }

                        if (recaptchaNeeded) {

                            var recaptchaWrapper = document.createElement("div");
                            recaptchaWrapper.classList.add("formsleads-recaptcha-wrapper");
                            if (customStyle.recaptchaWrapper) {
                                recaptchaWrapper.style = customStyle.recaptchaWrapper;
                            }
                            
                            if (popupRecaptcha) {
                                if (args.popupRecaptcha === "inside") {
                                    formContainer.style.position = "relative";
                                }

                                popupDiv.classList.add("formsleads-recaptcha-popup");
                                
                                if (customStyle.recaptchaPopup) {
                                    popupDiv.style = customStyle.recaptchaPopup;
                                }
                                
                                popupDiv.appendChild(recaptchaWrapper);
                                
                                formElement.appendChild(popupDiv);
                            } else {
                                formElement.appendChild(recaptchaWrapper);
                            }
                            var rcWidget = addRecaptcha(recaptchaNeeded, recaptchaWrapper, rcWidget, recaptchaCallback);
                        }

                        var messageContainer = document.createElement("div");
                        if (!hideAllMessages) {
                            formElement.appendChild(messageContainer);
                        }
                        
                        messageContainer.appendChild(successElement);
                        messageContainer.appendChild(errorElement);

                        var submitBtnWrapper = document.createElement("div");
                        submitBtnWrapper.classList.add("formsleads-form-submit-btn-wrapper");

                        if (customStyle.buttonWrapper) {
                            submitBtnWrapper.style = customStyle.buttonWrapper;
                        }


                        submitBtnWrapper.appendChild(formsleadsBtn);

                        // Text above Submit button
                        createTextElement(texts.aboveSubmit, customStyle.aboveSubmitText, formElement);

                        formElement.appendChild(submitBtnWrapper);

                        // Text below Submit button
                        createTextElement(texts.belowSubmit, customStyle.belowSubmitText, formElement);

                        formElement.onsubmit = onFormsLeadsFormSubmit(args, recaptchaNeeded, errorElement, successElement, formsleadsBtn, formElement, popupDiv, outsidePopup);

                        formsleads.forms[args.wrapperId] = { rendered: true, fields: formFields, values: {} };
                    });
                }).catch(function() {
                    console.error("error in appKey");
                    domReady(function() {
                        injectCSS();
                        formContainer = document.getElementById(args.wrapperId);

                        if (!formContainer) return;
                        
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