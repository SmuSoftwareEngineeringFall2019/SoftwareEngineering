//Variables to keep track of previous states
var oldStack = [];
var currentStack;

//current text field being edited
var focus = "userText";

//Variables for cursor and it's position in the text
var curs;
var start;
var end;

//Height of textarea
var textareaSize;

//Var to keep track of whether the last button pushed was a predicted word
var lastPred = false;

//Boards
var lowerBoard = ["", "", "", "", "",
    "`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace",
    "[", "]", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "delword",
    "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", "\'", "enter",
    ";", "\\", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/",
    "Undo", "space", "Redo"
];

var capBoard = ["", "", "", "", "",
    "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "backspace",
    "{", "}", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "delword",
    "caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", "\"", "enter",
    ":", "|", "Z", "X", "C", "V", "B", "N", "M", "<", ">", "?",
    "Undo", "space", "Redo"
];

var dictionary = [];

//Predictive words (load in from text file)
var dictionary2 = new XMLHttpRequest();
dictionary2.open('GET', '/ProcessedDictionaryWords.txt');
dictionary2.onreadystatechange = function () {
   dictionary = dictionary2.responseText.split("\n");
};
dictionary2.send();

//Save current body
try {
    currentStack = [document.getElementById("userText").value];
} catch (typeError)
{
    currentStack = [""];
}


function startUp() {
    if (document.getElementById("userText").value === "") {
        document.getElementById("title").value = "";
    }

    getCursor();
    predict();
    updateBoard();

//Autosave every 30 seconds
    var periodicSave = setInterval(myTimer, 30000);

    function myTimer() {
        edit();
    }
    //Listen for when a key is released. Writer works with hardwired keyboard
    //and onscreen keyboard together.
    document.addEventListener('keyup', function (event) {
        getCursor();
        if (focus === "userText") {
            //If last word was predicted and the next thing pressed is
            //a punctuation, remove the space after the word
            if (lastPred && (document.getElementById("userText").value.substring(start - 1, start) === "." ||
                    document.getElementById("userText").value.substring(start - 1, start) === "!" ||
                    document.getElementById("userText").value.substring(start - 1, start) === "?" ||
                    document.getElementById("userText").value.substring(start - 1, start) === "," ||
                    document.getElementById("userText").value.substring(start - 1, start) === "\"" ||
                    document.getElementById("userText").value.substring(start - 1, start) === "'")) {
                //A single letter is added
                //Add the word to the textarea
                var nextString = document.getElementById(focus).value;
                //Using cursor location, determine where the letter is to be added
                var first = nextString.substring(0, start - 2);
                var last = nextString.substring(end - 1, nextString.length);

                //add the letter
                document.getElementById(focus).value = first + last;
            }
            updateStack();
        }
        predict();
        updateBoard();
        lastPred = false;
    });
}

/** 
 * Adds a word to the textarea
 * 
 * @param {String} word The word to be added to the textarea 
 **/
function addWord(word) {
    document.getElementById(focus).focus();
    switch (word.length) {
        case 0:
            //Empty Predicted word is selected. Do nothing and re-establish
            //cursor at end of highlighted area
            document.getElementById(focus).setSelectionRange(end, end);
            getCursor();
            break;
        case 1:
            //If a period is being pressed and predict was last used, remove
            //space.
            if ((word === "." || word === "!" || word === "?" || word === "," ||
                    word === "\"" || word === "'") && lastPred === true) {
                start = start - 1;
            }
            //A single letter is added
            //Add the word to the textarea
            var nextString = document.getElementById(focus).value;
            //Using cursor location, determine where the letter is to be added
            var first = nextString.substring(0, start);
            var last = nextString.substring(end, nextString.length);

            //add the letter
            document.getElementById(focus).value = first + word + last;
            //If the cursor is only highlighting a single character, move it
            //one space to the right
            if (start === end) {
                start++;
                end++;
                document.getElementById(focus).setSelectionRange(start, end);
                getCursor();
            } else {
                //If soemthing was highlighted, it is now replaced by a single
                //character. Move cursor to start location + 1
                start++;
                end = start;
                document.getElementById(focus).setSelectionRange(start, end);
                getCursor();
            }
            if (focus === "userText") {
                updateStack();
            }
            predict();
            updateBoard();
            lastPred = false;
            break;

        default:
            //Predicted word is selected
            //If something is highlighted, reapply focus and do nothing
            if (curs.selectionStart === curs.selectionEnd) {
                var tempTracker = start;
                var tempString = [];
                var fill = "";
                //Move left until the start of the word is found
                while (document.getElementById(focus).value.substring(tempTracker - 1, tempTracker) !== " " &&
                        document.getElementById(focus).value.substring(tempTracker - 1, tempTracker) !== "" &&
                        document.getElementById(focus).value.substring(tempTracker - 1, tempTracker) !== "\n")
                {
                    tempString.push(document.getElementById(focus).value.substring(tempTracker - 1, tempTracker));
                    tempTracker--;
                }
                //Fill in missing letters to complete the word
                fill = word.substring(tempString.length, word.length);
                document.getElementById(focus).focus();
                //Add the word to the textarea
                var nextString = document.getElementById(focus).value;
                var first = nextString.substring(0, start);
                var last = nextString.substring(end, nextString.length);

                document.getElementById(focus).value = first + fill + " " + last;

                //Move cursor to end of word
                start = start + fill.length + 1;
                end = end + fill.length + 1;
                if (focus === "userText") {
                    updateStack();
                }
                predict();
                updateBoard();
                lastPred = true;
            }
            document.getElementById(focus).setSelectionRange(end, end);
            getCursor();
            break;
    }
}

//Each change updates the board so predictive text buttons are updated
//in real time
function updateBoard() {
    //Reconstruct keyboard
    var board;
    if (Keyboard.properties.capsLock) {
        board = capBoard;
    } else {
        board = lowerBoard;
    }
    var i = 0;
    for (const key of Keyboard.elements.keys) {

        if (key.childElementCount === 0) {
            key.textContent = board[i];
        }
        i++;
    }
    //adjust size of textbox relative to keyboard
    textareaSize = document.getElementsByClassName("keyboard keyboard--hidden")[0].offsetTop - document.getElementById("userText").offsetTop - 10;
    document.getElementById("userText").style.height = textareaSize + "px";
}

//Determine predicted words
function predict() {
    //predictive
    var tempTracker = start;
    var tempString = [];
    var predict = "";
    //Find start of word
    while (document.getElementById(focus).value.substring(tempTracker - 1, tempTracker) !== " " &&
            document.getElementById(focus).value.substring(tempTracker - 1, tempTracker) !== "" &&
            document.getElementById(focus).value.substring(tempTracker - 1, tempTracker) !== "\n")
    {
        tempString.push(document.getElementById(focus).value.substring(tempTracker - 1, tempTracker));
        tempTracker--;
    }
    tempString.reverse();
    for (var i = 0; i < tempString.length; i++) {
        predict = predict + tempString[i];
    }
    predict = predict.toLowerCase();

//Find 5 first words in dictionary with same start as current string
    var d = 0;
    var b = 0;
    while (d < 5 && b < dictionary.length) {
        if (dictionary[b].length >= predict.length) {
            if (dictionary[b].substring(0, predict.length) === predict) {
                lowerBoard[d] = dictionary[b];
                capBoard[d] = dictionary[b].toUpperCase();
                d++;
            }
        }
        b++;
    }
    //fill in buttons with no matches
    if (d < 5) {
        for (var y = d; y < 5; y++) {
            lowerBoard[y] = "";
            capBoard[y] = "";
        }
    }
}

//Backspace/delete highlighted text with respect to cursor position
function del() {
    document.getElementById(focus).focus();

    var curString = document.getElementById(focus).value;

    //If cursor is in one spot, remove last character
    if (start === end) {
        document.getElementById(focus).value =
                curString.substring(0, start - 1)
                + curString.substring(end, curString.length);
        if (start > 0) {
            start--;
            end--;
        }
        document.getElementById(focus).setSelectionRange(start, end);
        getCursor();
    } else {
        //Else, delete current highlighted area and move cursor
        document.getElementById(focus).value =
                curString.substring(0, start)
                + curString.substring(end, curString.length);
        end = start;
        document.getElementById(focus).setSelectionRange(start, end);
        getCursor();
    }

    if (focus === "userText") {
        updateStack();
    }
    predict();
    updateBoard();
    predLast = false;
}

//Delete the word the cursor is currently on (including space before word)
function delword() {
    //If a section is highlighted, Call del() to delte it
    if (start !== end) {
        del();
    } else {
        //Else, locate left and right bounds of word and remove the word.
        document.getElementById(focus).focus();
        var curText = document.getElementById(focus).value;

        //get left bound
        var i = 0;
        while (curText.substring(start - i - 1, start - i) !== " " &&
                curText.substring(start - i - 1, start - i) !== "\n" &&
                start - i >= 0) {
            i++;
        }

        //get right bound
        var j = 0;
        while (curText.substring(start + j, start + j + 1) !== " " &&
                curText.substring(start + j, start + j + 1) !== ""
                && start + j <= curText.length) {
            j++;
        }
        //Remove word using calculated bounds
        document.getElementById(focus).value = curText.substring(0, start - i - 1)
                + curText.substring(start + j, curText.length);
        //if the cursor is not at start, move it left 1 extra to account for
        //removed space. Otherwise set start to 0
        if (start > 0) {
            start = start - i - 1;
        } else
            start = 0;
        //If moving left caused start to become negative, change it to 0
        if (start < 0) {
            start = 0;
        }
        end = start;
        document.getElementById(focus).setSelectionRange(start, end);
        if (focus === "userText") {
            updateStack();
        }
        getCursor();
        predict();
        updateBoard();
        predLast = false;
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
        predLast = false;
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
        predLast = false;
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
        while (oldStack.length > 15) {
            oldStack.shift();
        }
        currentStack.push(document.getElementById("userText").value);
    }
}
function navigation(direction) {

    var x = document.getElementById("userText");
    switch (direction) {
        case 0:
            //Scroll down one window
            x.scrollTo(0, x.scrollTop + textareaSize);
            break;
        case 1:
            //Scroll up one window
            x.scrollTo(0, x.scrollTop - textareaSize);
            break;
        case 2:
            //Scroll to bottom
            x.scrollTo(0, 1000000000);
            break;
        case 3:
            //Scroll to top
            x.scrollTo(0, 0);
            break;
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

//On close, check if the current data is the same as the most recent save.
//If not, Save it locally as well as indicator saying it was not saved.
function checkSave() {
    edit();
}


//Edit a post on the database
function edit() {

    var title = document.getElementById("title").value;
    //If title is empty, fill it with todays date
    if (title === "") {
        var date;
        var month = new Date().getMonth();
        var day = new Date().getDate();
        var year = new Date().getFullYear();
        switch (month) {
            case 0:
                date = "January";
                break;
            case 1:
                date = "February";
                break;
            case 2:
                date = "March";
                break;
            case 3:
                date = "April";
                break;
            case 4:
                date = "May";
                break;
            case 5:
                date = "June";
                break;
            case 6:
                date = "July";
                break;
            case 7:
                date = "August";
                break;
            case 8:
                date = "September";
                break;
            case 9:
                date = "October";
                break;
            case 10:
                date = "November";
                break;
            case 11:
                date = "December";
                break;
        }
        title = date + " " + day + " " + year;
    }
    var body = document.getElementById("userText").value;
    var time = Date.now();
    var blogId = document.getElementById('blogId').innerHTML;
    blogId = JSON.parse(blogId);
    var user = document.getElementById('userId').innerHTML;
    user = JSON.parse(user);
    title = encodeURIComponent(title);
    body = encodeURIComponent(body);
    data = 'title=' + title + '&body=' + body + "&time=" + time;
    console.log(blogId);
    var xhttp = new XMLHttpRequest();
    xhttp.open('put', '/' + user + '/' + blogId, true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(data);
}

//Gets cursor position in the string
function getCursor() {
    curs = document.getElementById(focus);
    start = curs.selectionStart;
    end = curs.selectionEnd;
}

//create keyboard
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
    },

    _createKeys() {
        const fragment = document.createDocumentFragment();

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };

        var q = 0;
        lowerBoard.forEach(key => {

            const keyElement = document.createElement("button");

            const insertLineBreak = ["backspace", "delword", "enter", "/"].indexOf(key) !== -1;

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

                case "delword":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("first_page");

                    keyElement.addEventListener("click", () => {
                        delword();
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
                case "Undo":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = "Undo";

                    keyElement.addEventListener("click", () => {
                        undo();
                    });

                    break;
                case "Redo":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = "Redo";

                    keyElement.addEventListener("click", () => {
                        redo();
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
                    if (q < 5) {
                        keyElement.classList.add("keyboard__key--predict-wide");
                    }
                    keyElement.textContent = key.toLowerCase();

                    keyElement.addEventListener("click", () => {
                        addWord(keyElement.textContent);
                    });
                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak || q === 4) {
                fragment.appendChild(document.createElement("br"));
            }
            q++;
        });

        return fragment;
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;
        document.getElementById(focus).focus();
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

