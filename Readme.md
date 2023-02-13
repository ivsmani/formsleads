# FormsLeads form creation cdn script and css [1.1.0]

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
- `afterSubmit` func > A callback function which will be triggered after successfully submiting the form.
- `text` object > Add texts in the form in different locations. Check the details below for configurations.
- `hiddenFields` array > Hide any fields with simple configuration. Refer below for more details
- `validate` array > Validate any textfields. Refer below for more details on implementation

## Custom styles
Add css to each and every elements in the form, created using the formsleads. The following element keys are available to make your own form styles. Just add your css for each element as string.
Like this 👉🏻 `formTitle: "font-size: 30px; color: #e0e0e0;"`

```
customStyle: {
    formTitle: "",
    form: "",
    fieldWrapper: "",
        input: "",
        select: "",     
        label: "",
    recaptchaWrapper: "",
    buttonWrapper: "",
        button: "",
    belowTitleText: "",
    aboveRecaptchaText: "",
    aboveSubmitText: "",
    belowSubmitText: "",
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
Text can be added in 4 locations of the form and use the below format to configure. Also those texts can be styled using above custom styles.

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