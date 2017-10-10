# fng-bootstrap-date

Plugin for forms-angular that adds date picker from [Angular UI Bootstrap](https://github.com/angular-ui/bootstrap) support.

## Usage

    bower install fng-bootstrap-date

Add the following line to your index.html (or equivalent) file.

    <script src="bower_components/fng-bootstrap-date/fng-bootstrap-date.js"></script>
    
Add `fng.uiBootstrapDate` to the list of servies your Angular module depends on. 

In your Mongoose schemas you can set up fields like this:

    applicationReceived: {type: Date, form: {
        directive:"fng-ui-bootstrap-date-picker", 
        fngUiBootstrapDatePicker: {
            format: 'dd MMM yyyy', 
            "ng-model-options":"{timezone:\'UTC\'}" 
        }
    }},

Options can be added to a fngUiBootstrapDatePicker object within the form object as illustrated by the examples above.  For (my) convenience, the default format has been changed to dd/MM/yyyy

###Known Limitations:

Styling in (unsupported) Bootstrap 2 applications (such as the forms-angular.org website at the time of writing) has a few issues,
including inline help placing and the width of the first columnof the dropdown when weeks are not shown. 