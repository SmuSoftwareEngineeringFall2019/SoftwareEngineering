/** 
 * TODO 
 * Change from local storage
 * end of line and new characterto go on next line
 * cursor position after undo/redo.
 * JUDY WITH ONLY TOP BUTTONS TO WORK WITH KEYBOARD
 * http://ugdev.cs.smu.ca:3000/create
 * 
 * 
 * Author: Jacob Vincent (A00419169)
 **/
var lowerBoard = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=",
    "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]",
    "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "\\'", "\\\\",
    "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"];

var capBoard = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+",
    "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "{", "}",
    "A", "S", "D", "F", "G", "H", "J", "K", "L", ":", "&quot;", "|",
    "Z", "X", "C", "V", "B", "N", "M", "<", ">", "?"];

//Stacks for redoing/undoing
var oldStack = [];
var currentStack;

//current text field being edited
var focus = "title";

//capital or lowercase keyboard
var cap = false;

//Variables for cursor and it's position in the text
var curs;
var start;
var end;

try {
    currentStack = [document.getElementById("userText").value];
} catch (typeError)
{
    currentStack = [""];
}

//called On load
function startUp() {
    makeBoard();
    getCursor();
    document.addEventListener('keyup', function (event) {
        getCursor();
        if (focus === "userText") {
            updateStack();
        }
    });
}
//switch between caps/lower
function makeBoard() {
    var keyboard = [];
    if (cap) {
        keyboard = capBoard;
    } else {
        keyboard = lowerBoard;
    }
    //create buttons
    $("div.keyboardRow1").html("");
    $("div.keyboardRow1").trigger("create");
    $("div.keyboardRow2").html("");
    $("div.keyboardRow2").trigger("create");
    $("div.keyboardRow3").html("");
    $("div.keyboardRow3").trigger("create");
    $("div.keyboardRow4").html("");
    $("div.keyboardRow4").trigger("create");

//create 4 rows of words 
    //string being built to represent the button in HTML
    var htmlString = "";
    var leng = 12;
    var index = 0;

//create the 4 blocks of buttons
    for (j = 0; j < 4; j++) {
        htmlString = "<div data-role='controlgroup' data-type='horizontal'>";
        //Last row has 10 buttons
        if (j === 3) {
            leng = 10;
        }

        var i = 0;
        while (i < leng) {
            var displayString = keyboard[index];
            if(keyboard[index] === "\\'" || keyboard[index] === "\\\\"){
                displayString = keyboard[index].substring(1,2);
            }
            htmlString = htmlString +
                    "<a data-role=\"button\" onclick=\"addWord('"
                    + keyboard[index] + "')\">" + displayString + "</a>";
            i++;
            index++;
        }
        //end current block of buttons (each row)
        htmlString = htmlString + "</div>";

        //get the name of the row to be edited in the html file
        var classStr = "div.keyboardRow" + (j + 1);

        //change the text of that line to be the block of buttons
        $(classStr).append(htmlString);
        $(classStr).trigger("create");
    }
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
        start--;
        end--;
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

        oldStack.push(checkEqual);
        currentStack.push(document.getElementById("userText").value);
    }
}

//Change the keyboard
function caps() {
    if (cap) {
        cap = false;
        makeBoard();
    } else {
        cap = true;
        makeBoard();
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

//Gets cursor position in the string
function getCursor() {

    curs = document.getElementById(focus);
    start = curs.selectionStart;
    end = curs.selectionEnd;
}
//Publish current session to database
function publish() {
    var title = document.getElementById("title").value;
    var body = document.getElementById("userText").value;
    var author = document.getElementById("author").value;
    var time = Date.now();

    title =  encodeURIComponent(title);
    body =  encodeURIComponent(body);
    author =  encodeURIComponent(author);

    if (author != 'Judi' && author != "Michael") {
      return;
    }

    //this stops escape characters from breaking the POST
    data = 'title='+title+'&body='+body+'&author='+author+"&time="+time;

    console.log(data);
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', '/create/new', true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(data);
}

