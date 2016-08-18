/*
 * This file is require()'d by `./commentParser.js`.
*/
var fs = require('fs'),
    Entities = require('html-entities').AllHtmlEntities,
    entities = new Entities(),
    formattedComponents = [];

module.exports = {
    _formatComments: function(json) {
        console.log('Formatting comments for snippet conversion...');

        // Restructure JSON output from commentParser into formattedComponents [{component}, {component}, {component}] etc...
        json.map(function(component, index) {
            var currentComponent = {};

            currentComponent.index = index;
            currentComponent.description = component.description;

            component.tags.map(function(tag) {
                var key = tag.tag,
                    value = tag.description;

                currentComponent[key] = value;

                // Grab outerElement from example code
                if (tag.tag === 'example') {
                    var regex = /\<(.*?)\ /,
                        stringToMatch = tag.description,
                        outerElement = regex.exec(stringToMatch)[1];

                    currentComponent.outerElement = outerElement;
                }
            });

            formattedComponents.push(currentComponent);
        });
        console.log('Formatting complete.');

        // Convert formattedComponents to code snippets and save the snippet files
        this._convert(formattedComponents);
    },
    _convert: function(json) {
        console.log('Converting code snippets...');

        // Loop through all components, passed into _convert() as json
        json.map(function(component) {
            var defaultTextWithTabStop = '',
                numberOfDefaultClasses = component.defaultClasses.length,
                numberOfOptionalClasses = component.optionalClasses.length,
                tabStopIndex = 1,
                sublimeSnippet = '',
                sublimeDefaultClasses = '',
                sublimeOptionalClasses = '',
                vimSnippet = '',
                phpStormSnippet = '',
                phpStormTabStopIndex = 1,
                phpStormOptionalClasses = '',
                phpStormOptionalClassVariables = '',
                phpStormBaseHtml = '',
                phpStormEncodedHtml = '';

            // Assemble Sublime snippet
            sublimeSnippet += '<!-- ' + component.name + ' -->\n<snippet><content><![CDATA[\n';
            sublimeSnippet += component.example.replace(/---]/g, '    ') + '\n';
            sublimeSnippet += ']]></content><tabTrigger>' + component.tabTrigger + '</tabTrigger>';
            sublimeSnippet += '<scope>text.html</scope></snippet>';

            // Write the Sublime Text 3 code snippet file
            fs.writeFile('./code_snippets/sublime/' + component.tabTrigger + '.sublime-snippet', sublimeSnippet, function(err) {
                if (err) {
                    return console.log(err);
                }
            });

            // Assemble Vim snippet
            vimSnippet += 'snippet ' + component.tabTrigger + ' "' + component.name + '" b' + '\n';
            vimSnippet += component.example.replace(/---]/g, '    ') + '\n';
            vimSnippet += 'endsnippet';

            // Write the Vim code snippet file
            fs.writeFile('./code_snippets/vim/' + component.tabTrigger + '.snippets', vimSnippet, function(err) {
                if (err) {
                    return console.log(err);
                }
            });

            // Assemble PhpStorm snippet
            phpStormBaseHtml = component.example;
            phpStormEncodedHtml = entities.encode(phpStormBaseHtml);
            phpStormSnippet += '<template name="' + component.tabTrigger + '" value="' + phpStormEncodedHtml.replace(/---]/g, '\t').replace(/\r?\n|\r/g, '&#13;') + '" description="' + component.name + '" toReformat="false" toShortenFQNames="true">';
            phpStormSnippet += '\n\t<context>\n\t\t<option name="HTML" value="true" />\n\t</context>\n</template>';

            // Write the PhpStorm code snippet file
            fs.writeFile('./code_snippets/phpstorm/' + component.tabTrigger + '.xml', phpStormSnippet, function(err) {
                if (err) {
                    return console.log(err);
                }
            });

        });

        console.log('Code snippets converted and saved.');
    }
}
