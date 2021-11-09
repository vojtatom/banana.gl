import { Button, CubeIcon, Heading, Pane, UpdatedIcon, ProjectsIcon, CodeIcon, CornerDialog, Pre } from 'evergreen-ui'
import { useHistory, useParams } from 'react-router';
import { Header } from './elements/header';

import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { TextDialog } from './elements/dialog';
import { apiurl, url } from '../url';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import iaxios from '../axios';



/* eslint-disable quotes */

// This config defines the editor's view.
export const options = {
    lineNumbers: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    fontSize: 12,
}

// This config defines how the language is displayed in the editor.
export const languageDef = {
    defaultToken: "",
    number: /\d+(\.\d+)?/,

    //here is the list of all the tokens 
    //it as adressed as @keywords in the tokenizer
    keywords: [
        "@layer",
        "@target",
        "@source",
        "@meta"
    ],
    
    typeKeywords: [
        "@default",
        "@color",
        "@visible",
    ],

    // we include these common regular expressions
	symbols: /[=><!~?:&|+\-*\/\^%]+/,
	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	digits: /\d+(_+\d+)*/,
	octaldigits: /[0-7]+(_+[0-7]+)*/,
	binarydigits: /[0-1]+(_+[0-1]+)*/,
	hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

	regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
	regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,


    tokenizer: {
        root: [
			[/[{}]/, 'delimiter.bracket'],
			{ include: 'common' }
		],

		common: [
			// identifiers and keywords
			[/@[a-z_$][\w$]*/, {
				cases: {
					'@typeKeywords': 'keyword',
					'@keywords': 'type.identifier',
					'@default': 'identifier'
				}
			}],
			//[/[A-Z][\w\$]*/, 'type.identifier'],  // to show class names nicely
			// [/[A-Z][\w\$]*/, 'identifier'],

			// whitespace
			{ include: '@whitespace' },

			// regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
			[/\/(?=([^\\\/]|\\.)+\/([gimsuy]*)(\s*)(\.|;|\/|,|\)|\]|\}|$))/, { token: 'regexp', bracket: '@open', next: '@regexp' }],

			// delimiters and operators
			[/[()\[\]]/, '@brackets'],
			[/[<>](?!@symbols)/, '@brackets'],
			[/@symbols/, {
				cases: {
					'@default': ''
				}
			}],

			// numbers
			[/(@digits)[eE]([\-+]?(@digits))?/, 'number.float'],
			[/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, 'number.float'],
			[/0[xX](@hexdigits)/, 'number.hex'],
			[/#(@hexdigits)/, 'number.hex'],
			[/0[oO]?(@octaldigits)/, 'number.octal'],
			[/0[bB](@binarydigits)/, 'number.binary'],
			[/(@digits)/, 'number'],

			// delimiter: after number because of .\d floats
			[/[;,.]/, 'delimiter'],

			// strings
			[/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
			[/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
			[/"/, 'string', '@string_double'],
			[/'/, 'string', '@string_single'],
			[/`/, 'string', '@string_backtick'],
		],

		whitespace: [
			[/[ \t\r\n]+/, ''],
		],


		// We match regular expression quite precisely
		regexp: [
			[/(\{)(\d+(?:,\d*)?)(\})/, ['regexp.escape.control', 'regexp.escape.control', 'regexp.escape.control']],
			[/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/, ['regexp.escape.control', { token: 'regexp.escape.control', next: '@regexrange' }]],
			[/(\()(\?:|\?=|\?!)/, ['regexp.escape.control', 'regexp.escape.control']],
			[/[()]/, 'regexp.escape.control'],
			[/@regexpctl/, 'regexp.escape.control'],
			[/[^\\\/]/, 'regexp'],
			[/@regexpesc/, 'regexp.escape'],
			[/\\\./, 'regexp.invalid'],
			[/(\/)([gimsuy]*)/, [{ token: 'regexp', bracket: '@close', next: '@pop' }, 'keyword.other']],
		],

		regexrange: [
			[/-/, 'regexp.escape.control'],
			[/\^/, 'regexp.invalid'],
			[/@regexpesc/, 'regexp.escape'],
			[/[^\]]/, 'regexp'],
			[/\]/, { token: 'regexp.escape.control', next: '@pop', bracket: '@close' }],
		],

		string_double: [
			[/[^\\"]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, 'string', '@pop']
		],

		string_single: [
			[/[^\\']+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/'/, 'string', '@pop']
		],

		string_backtick: [
			[/\$\{/, { token: 'delimiter.bracket', next: '@bracketCounting' }],
			[/[^\\`$]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/`/, 'string', '@pop']
		],

		bracketCounting: [
			[/\{/, 'delimiter.bracket', '@bracketCounting'],
			[/\}/, 'delimiter.bracket', '@pop'],
			{ include: 'common' }
		],
    },
}

// This config defines the editor's behavior.
export const configuration = {
    brackets: [
        ["{", "}"], ["[", "]"], ["(", ")"],
    ],
}

interface IStyle {
    name: string;
    style: string;
}

function createDependencyProposals(range: any) {
    // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
    // here you could do a server side lookup
    return [
        {
            label: 'Layer class',
            kind: monaco.languages.CompletionItemKind.Class,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Layer style class",
            insertText: 'layer (${1:layer-key}) {\n    ${2:@properties}\n}',
            range: range
        },
        {
            label: 'Target styles',
            kind: monaco.languages.CompletionItemKind.Class,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Styles based on metadata of the overlay source layer",
            insertText: 'target {\n    ${1:value}\n}',
            range: range
        },
        {
            label: 'Source styles',
            kind: monaco.languages.CompletionItemKind.Class,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Styles based on metadata of the overlay target layer",
            insertText: 'source {\n    ${1:value}\n}',
            range: range
        },
        {
            label: 'Meta class',
            kind: monaco.languages.CompletionItemKind.Class,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Styles based on metadata of the layer",
            insertText: 'meta (${1:identifier}) {\n    ${2:value}\n}',
            range: range
        },
        {
            label: 'Color value',
            kind: monaco.languages.CompletionItemKind.Value,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Color style class",
            insertText: 'color: #${1:color};',
            range: range
        },
        {
            label: 'Visibility value',
            kind: monaco.languages.CompletionItemKind.Value,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Visibility style class",
            insertText: 'visible: ${1:boolean};',
            range: range
        },
        {
            label: 'Default value',
            kind: monaco.languages.CompletionItemKind.Value,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Default style class",
            insertText: 'default: ${1:value};',
            range: range
        },
    ];
}

const headingSpace = /^(\s*)/;
const trailingSpace = /(\s*)$/;
const nothing = /(\s*|$)/;
const key = /\(([^)]+)\)/;
const proptag = /@[a-zA-Z]+/;


const matchTag = new RegExp(headingSpace.source + proptag.source + trailingSpace.source, 'mg');


export function StyleEditor() {
    const { project_name, style_name } = useParams<{ project_name: string, style_name: string }>();
    const history = useHistory();

    const beforMountEditor = (monaco: Monaco) => {
        if (!monaco.languages.getLanguages().some(({ id }) => id === 'estimatemd')) {
            // Register a new language
            monaco.languages.register({ id: 'estimatemd' })
            // Register a tokens provider for the language
            monaco.languages.setMonarchTokensProvider('estimatemd', languageDef as any)
            // Set the editing configuration for the language
            monaco.languages.setLanguageConfiguration('estimatemd', configuration as any)

            monaco.languages.registerCompletionItemProvider('estimatemd', {
                provideCompletionItems: function (model, position) {

                    var textUntilPosition = model.getValueInRange({ startLineNumber: 0, startColumn: 0, endLineNumber: position.lineNumber, endColumn: position.column });
                    var match = textUntilPosition.match(matchTag);

                    if (!match) {
                        return { suggestions: [] };
                    }

                    var word = model.getWordUntilPosition(position);

                    var range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    };

                    return {
                        suggestions: createDependencyProposals(range)
                    };
                }
            });
        }
    }

    
    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor|undefined>(undefined)
    
    useEffect(() => {
        if(!editor)
            return;
        
        iaxios.post(apiurl.GETSTYLE, { project: project_name, name: style_name }).then((response) => {
            const data: IStyle = response.data;
            editor.setValue(data.style);
        }).catch((reject) => {
            console.error(reject);
        });

    }, [editor]);

    const [isParsedShown, setParsedIsShown] = useState(false)
    const [parsed, setParsed] = useState("");

    const parse = () => {
        if(!editor)
            return;

        const style = editor.getValue();
        iaxios.post(apiurl.PARSESTYLE, { project: project_name, name: style_name, styles: style }).then((response) => {
            console.log(response);
            if (response.data.status === "error")
            {
                setParsed(response.data.error);
                setParsedIsShown(true);
            } else {
                setParsed("Style parsed successfuly");
                setParsedIsShown(true);
            }
        }).catch((reject) => {
            console.error(reject);
        });        
    }


    return (
        <Pane>
            <Header projects />
            <Pane className="stylesHeader">
                <Heading className="wide">Style {style_name}</Heading>
                <Button marginRight={12} appearance="minimal" iconBefore={ProjectsIcon} onClick={() => { history.push(url.PROJECTS + project_name) }}>
                    Back to Project {project_name}
                </Button>
                <CornerDialog
                    title="Style Parsed"
                    hasCancel={false}
                    hasFooter={false}
                    width="auto"
                    isShown={isParsedShown}
                    onCloseComplete={() => setParsedIsShown(false)}
                >
                <Pre className="parsedMessage">{parsed}</Pre>
                </CornerDialog>
                <Button marginRight={12} appearance="minimal" iconBefore={CodeIcon} onClick={parse}>
                    Parse
                </Button>
                <TextDialog
                    submitUrl={apiurl.UPDATESTYLE}
                    title={`Save style ${style_name}`}
                    label={`Are you sure you want to save style ${style_name}? Your previously compiled styles will be overwriten.`}
                    confirmLabel="Overwrite"
                    method="post"
                    submitBody={() => { 
                        if (!editor)
                            throw 'Error occured while saving the style.'; 

                        return { project: project_name, name: style_name, styles: editor.getValue()} 
                    }}
                    onSubmit={() => {
                        console.log(`Style ${style_name} saved`);
                    }}

                    onError={(reject) => {return "Style could not be saved"}} 
                    tooltip="Saves the new configuration and overwrites previously saved styles."
                >
                    <Button marginRight={12} appearance="minimal" iconBefore={UpdatedIcon}>
                        Save
                    </Button>
                </TextDialog>
                <TextDialog
                    submitUrl={apiurl.UPDATESTYLE}
                    title={`Apply style ${style_name}`}
                    label={`Are you sure you want to recompile style ${style_name}?  Your previously compiled styles will be overwriten.`}
                    confirmLabel="Compile"
                    method="post"
                    submitBody={() => { 
                        if (!editor)
                            throw 'Error occured while saving the style.'; 

                        return { project: project_name, name: style_name, styles: editor.getValue()} 
                    }}
                    onSubmit={() => {
                        iaxios.post(apiurl.APPLYSTYLE, { project: project_name, name: style_name }).then((response) => {
                            toast('Compilation job submitted');
                        }).catch((reject) => {
                            toast('Job could not be submitted');
                        })
                    }}
                    onError={(reject) => {return "Style could not be recompiled"}} 
                    tooltip="Recompile styles after updating to view the changes in the visualization"
                >
                    <Button appearance="minimal" iconBefore={CubeIcon}>
                        Save and Compile
                    </Button>
                </TextDialog>
            </Pane>

            <Pane className="styles">
                <Editor
                    beforeMount={beforMountEditor}
                    onMount={(editor, monaco) => {
                        setEditor(editor);
                    }}
                    className="editor"
                    height="100%"
                    defaultLanguage="estimatemd"
                />
            </Pane>
        </Pane>
    )
}
