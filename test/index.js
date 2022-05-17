var test = require("tape");
var PostCSS = require("postcss");
var messageHelpers = require("..");

var postcss = PostCSS().use(function(styles) {
  styles.walkDecls(function transformDecl(decl) {
    decl.value = messageHelpers.try(function IwillThrow() {
      if (decl.value.indexOf("error(") > -1) {
        throw new Error("error detected: " + decl.value);
      }

      if (decl.value.indexOf("multierr(") > -1) {
        throw new Error("error detected: \n" + decl.value);
      }

      return "world";
    }, decl.source);
  });
});

test("postcss try helper", function(t) {
  try {
    postcss.process("\nthis{throws:error(alert!)}", { from: "file.css" }).css;
    t.fail("should throw an error with adjusted stack");
  } catch (e) {
    var stack = e.stack.split("\n");
    t.equal(
      e.message,
      process.cwd() + "/file.css:2:6: error detected: error(alert!)",
      "try() should throw an exception that contains a enhanced message"
    );
    t.equal(
      e.originalMessage,
      "error detected: error(alert!)",
      "try() should throw an exception that contains the original message as a property"
    );
    t.equal(
      stack[0],
      "Error: " +
        process.cwd() +
        "/file.css:2:6: error detected: error(alert!)",
      "try() should have an explicit message (sourcefile:lineno:column: message)"
    );
    t.equal(
      stack[1],
      "    at " + process.cwd() + "/file.css:2:6",
      "try() should have a new item in the stack trace (sourcefile:lineno:column)"
    );
  }

  try {
    postcss.process("\nthis{throws:error(alert!)}").css;
    t.fail("should throw an error with adjusted stack");
  } catch (e) {
    var stack2 = e.stack.split("\n");
    t.equal(
      stack2[0],
      "Error: <input css>:2:6: error detected: error(alert!)",
      "try() should have an explicit message (<input css>:lineno:column: message)"
    );
    t.ok(
      stack2[1].startsWith("    at <input css") && stack2[1].endsWith(">:2:6"),
      "try() should have a new item in the stack trace (<input css>:lineno:column)"
    );
  }

  try {
    postcss.process("\nthis{throws:multierr(alert!)}").css;
    t.fail("should throw an error with adjusted stack");
  } catch (e) {
    var stack3 = e.stack.split("\n");
    t.equal(
      stack3[0],
      "Error: <input css>:2:6: error detected: ",
      "try() should have an explicit message (<input css>:lineno:column: message)"
    );
    t.ok(
      stack3[2].startsWith("    at <input css") && stack3[2].endsWith(">:2:6"),
      "try() should have a new item in the stack trace (<input css>:lineno:column)"
    );
  }

  t.equal(
    postcss.process("say{hello:people}").css,
    "say{hello:world}",
    "try() should return the value of the callback if nothing happen"
  );

  t.end();
});
