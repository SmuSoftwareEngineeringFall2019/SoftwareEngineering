var oldStack = [];
var currentStack;

//current text field being edited
var focus = "userText";

//Variables for cursor and it's position in the text
var curs;
var start;
var end;

var lowerBoard = ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace",
    "tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]",
    "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", "\'", "enter",
    ";", "\\", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/",
    "space"
];

var capBoard = ["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "backspace",
    "tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "{", "}",
    "caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", "\"", "enter",
    ":", "|", "Z", "X", "C", "V", "B", "N", "M", "<", ">", "?",
    "space"
];

try {
    currentStack = [document.getElementById("userText").value];
} catch (typeError)
{
    currentStack = [""];
}
function startUp() {
    getCursor();
    //CHECK LOCAL STORAGE FOR ITENM OF LAST SESSION AND THEN FILL IN DATA

    document.addEventListener('keyup', function (event) {
        getCursor();
        if (focus === "userText") {
            updateStack();
        }
    });
}

/** 
 * Adds a word to the textarea
 * 
 * @param {String} word The word to be added to the textarea 
 **/
function addWord(word) {
    document.getElementById(focus).focus();
    //Add the word to the textarea
    var nextString = document.getElementById(focus).value;
    var first = nextString.substring(0, start);
    var last = nextString.substring(end, nextString.length);

    document.getElementById(focus).value = first + word + last;
    if (start === end) {
        start++;
        end++;
        document.getElementById(focus).setSelectionRange(start, end);
    } else {
        start++;
        end = start;
        document.getElementById(focus).setSelectionRange(start, end);
    }

    if (focus === "userText") {
        updateStack();
    }
}

//Backspace/delete highlighted text with respect to cursor position
function del() {
    document.getElementById(focus).focus();

    var curString = document.getElementById(focus).value;

    if (start === end) {
        document.getElementById(focus).value =
                curString.substring(0, start - 1)
                + curString.substring(end, curString.length);
        if (start > 0) {
            start--;
            end--;
        }
        document.getElementById(focus).setSelectionRange(start, end);
    } else {

        document.getElementById(focus).value =
                curString.substring(0, start)
                + curString.substring(end, curString.length);
        end = start;
        document.getElementById(focus).setSelectionRange(start, end);
    }

    if (focus === "userText") {
        updateStack();
    }
}

//Undo last change
function undo() {
    document.getElementById(focus).focus();
    if (oldStack.length > 0) {
        var lastText = oldStack.pop();
        currentStack.push(lastText);
        document.getElementById("userText").value = lastText;
        getCursor();
    }
}

//redo last undo
function redo() {
    document.getElementById(focus).focus();
    if (currentStack.length > 1) {
        oldStack.push(currentStack.pop());
        document.getElementById("userText").value =
                currentStack[currentStack.length - 1];
        getCursor();
    }
}

//Called after every change
function updateStack() {
    var checkEqual = currentStack.pop();
    if (checkEqual === document.getElementById("userText").value) {
        currentStack.push(checkEqual);  
    } else {
        currentStack = [];
        oldStack.push(checkEqual);
        while(oldStack.length > 15){
            oldStack.shift();
        }
        currentStack.push(document.getElementById("userText").value);
    }
}

//Check which field is active and where the cursor is after clicking it
function checkField(num) {

    if (num === 1) {
        focus = "userText";
    } else if (num === 0) {
        focus = "title";
    }
    getCursor();
}

//Publish current session to database
function publish() {
    var title = document.getElementById("title").value;
    var body = document.getElementById("userText").value;
    var author = document.getElementById("author").value;
    var time = Date.now();

    title = encodeURIComponent(title);
    body = encodeURIComponent(body);
    author = encodeURIComponent(author);

    if (author != 'Judi' && author != "Michael") {
        return;
    }

    //this stops escape characters from breaking the POST
    data = 'title=' + title + '&body=' + body + '&author=' + author + "&time=" + time;

    console.log(data);
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/create/new', true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(data);
    alert("success");
}


//Gets cursor position in the string
function getCursor() {

    curs = document.getElementById(focus);
    start = curs.selectionStart;
    end = curs.selectionEnd;
}

const Keyboard = {
    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },

    properties: {
        value: "",
        capsLock: false
    },

    init() {
        // Create main elements
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        // Automatically use keyboard for elements with .use-keyboard-input
        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });
        });
    },

    _createKeys() {
        const fragment = document.createDocumentFragment();

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };

        lowerBoard.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["backspace", "]", "enter", "/"].indexOf(key) !== -1;

            // Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "backspace":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("backspace");

                    keyElement.addEventListener("click", () => {
                        del();
                    });

                    break;

                case "caps":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("keyboard_capslock");

                    keyElement.addEventListener("click", () => {
                        this._toggleCapsLock();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
                    });

                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("keyboard_return");

                    keyElement.addEventListener("click", () => {
                        addWord("\n");
                    });

                    break;

                case "tab":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("keyboard_tab");

                    keyElement.addEventListener("click", () => {
                        addWord("\t");
                    });

                    break;

                case "space":
                    keyElement.classList.add("keyboard__key--extra-wide");
                    keyElement.innerHTML = createIconHTML("space_bar");

                    keyElement.addEventListener("click", () => {
                        addWord(" ");
                    });

                    break;

                default:
                    keyElement.textContent = key.toLowerCase();

                    keyElement.addEventListener("click", () => {
                        addWord(keyElement.textContent);
                    });
                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak) {
                fragment.appendChild(document.createElement("br"));
            }
        });

        return fragment;
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;
        var board;
        if (this.properties.capsLock) {
            board = capBoard;
        } else {
            board = lowerBoard;
        }
        var i = 0;
        for (const key of this.elements.keys) {

            if (key.childElementCount === 0) {
                key.textContent = board[i];
            }
            i++;
        }
    }
};

window.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});



