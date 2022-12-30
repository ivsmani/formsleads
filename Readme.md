# FormsLeads form creation cdn script and css

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
`formTitle` string > Change title of the form
`buttonText` string > Change submit button text of the form
`successText` string > Change success message text of the form
`customStyle` object > Add custom styles for each elements of the form
`afterSubmit` func > A callback function which will be triggered after successfully submiting the form.

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
        button: ""
}
```