var html_parser = new DOMParser();
var css_parser = new CSSParser();

var css_input = document.getElementById('css-input');
var html_input = document.getElementById('html-input');
var button = document.getElementById('button');
var output = document.getElementById('output');

Array.prototype.unique = function() {
    return this.reduce(function(accum, current) {
        if (accum.indexOf(current) < 0) {
            accum.push(current);
        }
        return accum;
    }, []);
};

function parse_css(css_string) {
    var all_css_rules = css_parser.parse(css_string, false, true).cssRules; 
    var css_id_selectors = [];
    var css_class_selectors = [];
    

    for (var i = 0; i < all_css_rules.length; i++) {
        try {
            var selector = all_css_rules[i].mSelectorText;
                if (selector[0] == "#") {
                    css_id_selectors.push(selector.substr(1));
                } else if (selector[0] == ".") {
                    css_class_selectors.push(selector.substr(1));
                }
        } catch(err) {
            // do nothing
        }
    }
    return { 
        "css_ids": css_id_selectors.unique(),
        "css_classes": css_class_selectors.unique()  
    };
}

function parse_html(html_string) {
    var parsed_html = html_parser.parseFromString(html_string, "text/html");   
    var all_tags = parsed_html.getElementsByTagName('*');
    var html_ids = [];
    var html_classes = [];
    for (var i = 0; i < all_tags.length; i++) {
        var current_tag = all_tags[i];
        if (current_tag.id) {
            html_ids.push(current_tag.id);
        }
        if (current_tag.className) {
            var classes_on_tag = current_tag.className.split(" ");
            for (var j = 0; j < classes_on_tag.length; j++) {
                html_classes.push(classes_on_tag[j]);
            }
        }

    }
    return { 
        "html_ids": html_ids.unique(),
        "html_classes": html_classes.unique()  
    };
}

function compare_html_css(html_list, css_list) {
    var unused_ids = [];
    for (var i = 0; i < html_list.html_ids.length; i++) {
        var current_id = html_list.html_ids[i];
        if (css_list.css_ids.indexOf(current_id) == -1) {
            unused_ids.push(current_id);
        } 
    }
    var unused_classes = [];
    /* jshint shadow:true */
    for (var i = 0; i < html_list.html_classes.length; i++) {
        var current_class = html_list.html_classes[i];
        if (css_list.css_classes.indexOf(current_class) == -1) {
            unused_classes.push(current_class);
        } 
    }
    return {
        "unused_ids": unused_ids,
        "unused_classes": unused_classes
    };
}

function make_output(strays) {
    var output = "";
    if (strays.unused_ids.length > 0) {
        output += "<p>The following id's have no selector:</p>";
        output += "<p class='list'>"; 
        output += strays.unused_ids.join(', ');
        output += ".</p>";
    }
    if (strays.unused_classes.length > 0) {
        output += "<p>The following classes have no selector:</p>";
        output += "<p class='list'>"; 
        output += strays.unused_classes.join(', ');
        output += ".</p>";
    }

    if (output === "") {
        output = "All of your html id's and classes have corresponding css selectors.";
    }
    return output;
}

function print_output(e) {
    var html_text = html_input.value;
    var css_text = css_input.value;
    var parsed_html = parse_html(html_text);
    var parsed_css = parse_css(css_text);
    var strays = compare_html_css(parsed_html, parsed_css);
    output.innerHTML = make_output(strays);
}

function setup_button() {
    button.onclick = print_output;
}

window.onload=function()
{
    setup_button();
};