# FormsLeads form creation cdn script and css [1.2.6]

`window.formsleads` will do all the magic.

Here is the basic code to integrate a form from FormsLeads.

```
 formsleads.render({
    wrapperId: "fl-form",
    notch: "xxxxxxxxxxxxxxxxxxxxx",
    // Rest of the configuration comes here
 }
```

### Configurations
- `formTitle` string > Change title of the form
- `buttonText` string > Change submit button text of the form
- `successText` string > Change success message text of the form
- `customStyle` object > Add custom styles for each elements of the form
- `afterSubmit` func > A callback function which will be triggered after successfully submiting the form. The first argument of the callback will be the form data in json format.
- `text` object > Add texts in the form in different locations. Check the details below for configurations
- `hiddenFields` array > Hide any fields with simple configuration. Refer below for more details
- `validate` array > Validate any textfields. Refer below for more details on implementation
- `format` array > Format any textfields. Refer below for more details on implementation
- `hideLabels` boolean > Hides the input labels if true
- `disableLabelAnimation` boolean > Disables the default label color and animation on interaction if true
- `hidePlaceholders` boolean > Hides the input placeholders if true
- `customOptions` array > Add custom options list for any drop down fields
- `changeInput` array > Change input type to textarea for any textfields. Check the configuration details below.
- `hideSuccessMessage` boolean > Hides the success message element when form is successfully submitted
- `hideAllMessages` boolean > Hides the success and error messages and it's wrapper div
- `customDropdown` boolean > If you want to style options of the select element, you should use a custom dropdown (It changes all the dropdown styles in a form)
- `popupRecaptcha` string oneOf("inside", "outside") > Make the recaptcha shown in the pop up. Inside means inside the form and out side means in the document body

## Custom styles
Add css to each and every elements in the form, created using the formsleads. The following element keys are available to make your own form styles. Just add your css for each element as string.
Like this 👉🏻 `formTitle: "font-size: 30px; color: #e0e0e0;"`

Note: From v1.2.0, you can add styles for the placeholders and also for the custom dropdowns. Please add placeholder styles for custom dropdown in the dropdown styles.

```
customStyle: {
    formTitle: "",
    form: "",
    fieldWrapper: "",
        input: "",
        select: "",     
        label: "",
    recaptchaWrapper: "",
    recaptchaPopup: "",
    buttonWrapper: "",
        button: "",
    belowTitleText: "",
    aboveRecaptchaText: "",
    aboveSubmitText: "",
    belowSubmitText: "",
    placeholder: "",
    dropdown: {
        wrapper: "",
        select: "",
        placeholder: "",
        list: "",
        firstOption: "",
        option: "",
        optionHover: ""
    }
}
```

## Text
Text can be added in 4 locations of the form and use the below format to configure. Also those texts can be styled using above custom styles.

```
text: {
    belowTitle: "Below Title",
    aboveSubmit: "Above submit",
    belowSubmit: "Below submit",
    aboveRecaptcha: "Above Recaptcha"
}
```

## Hidden Fields
Hide any fields in the form with a simple configuration. A list of objects with field index and the value is enough to hide all the field required.

Note: The fields hidden will be automatically set as not required. So if you are trying to hide a field, please make sure that it is not a required field. In the case of "Select" type of field, the value should be the value that is already available in the options added via formsleads, otherwise it will be empty.

index - field index which needs to be hidden
value - default value for the same field

```
hiddenFields: [
    {
        index: 1,
        value: "string"
    }
]
```

## Setting a custom value for a field
Now you can set any value (string) to any field with a new function `setValue`.

Arguements for the function includes
`wrapperId` > The id of the div wrapper you have used to wrap the form.
`fieldIndex` > The position or number of the field (1, 2, ...).
`Value` > The value of the field you want to set.

Usage
```
formsleads.setValue(wrapperId, fieldIndex, Value)
```

## Validating a field
Now you can add custom validation to any text field. Validating a phone number is available without any configuration. At the same time you can add regex for validating as per your requirement. It's very simple to add the validation as below.

- Phone number validation requires the index(fieldIndex), type (phone), message (optional) and onsubmit (optional and default value is false)
- Custom validation needs a regex to test against, index (fieldIndex) and a message

`index` > The position or number of the field (1, 2, ...).
`regex` > The regex to validate against.
`message` > Message to show as error.
`onsubmit` > default value is false. That means the validation happens on inputing the value. If it is true, then the validation happens only on submit.

```
validate: [
    { index: 3, type: "phone", message: "Please enter a valid US phone number 1234567980.", onsubmit: true },
    { index: 4, regex: "...", message: "Please enter a valid input." }
]
```

## Formating a field
Now you can format any text field value. Phone number formating for 111-111-1111 is available with type `us-phone`. At the same time you can use onChange event for formating as per your requirement. It's very simple to add formating as below.

- US Phone number formating requires the index(fieldIndex) and type (us-phone)
- Custom formating needs a function onChange, which should return a value, index (fieldIndex) and type (custom)

`index` > The position or number of the field (1, 2, ...).
`type` > oneOf("us-phone", "custom")
`onChange` > Event function with the input value in first argument and should return a value to set in the input

```
format: [
    { index: 3, type: "us-phone" },
    { index: 4, type: "custom", onChange: (value) => { var formatedValue = value; ...; return formatedValue; } }
]
```

## Custom options for drop down
You can make the options in any dropdown input dynamic with this custom options feature. The field targeting should be a select type. Use the below syntax to implement and it replaces the available options with custom options given. If you are dynamically changing the options, then the options key should be null to display the available options instead of custom options.

Note: Always try to avoid this feature, since there is a risk of data mismatching.

index - field index which you are targeting (It should be a select type field)
options - An array of option values to show

```
customOptions: [
    {
        index: 1,
        options: ["1", "2"]
    }
]
```

## Changing a Input element to Textarea
You can change any text input elements to textarea, so that you can have the functionalities of a text area.

index - field index which you are targeting (It should be a text input type field)
to - value should be "textarea"
styles - here you can style with css that you know.

```
changeInput: [
    {
        index: 1,
        to: "textarea",
        styles: ""
    }
]
```