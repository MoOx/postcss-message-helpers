var test = require("tape")
var PostCSS = require("postcss")
var messageHelpers = require("..")

var postcss = PostCSS()
  .use(function(styles) {
    styles.eachDecl(function transformDecl(decl) {
      decl.value = messageHelpers.try(function IwillThrow() {
        if (decl.value.indexOf("error(") > -1) {
          throw new Error("error detected: " + decl.value)
        }

        return "world"
      }, decl.source)
    })
  })

test("postcss try helper", function(t) {
  try {
    postcss.process("\nthis{throws:error(alert!)}", {from: "file.css"})
    t.fail("should throw an error with adjusted stack")
  }
  catch (e) {
    var stack = e.stack.split("\n")
    t.equal(stack[0], "Error: " + process.cwd() + "/file.css:2:6: error detected: error(alert!)", "try() should have an explicit message (sourcefile:lineno:column: message)")
    t.equal(stack[1], "    at " + process.cwd() + "/file.css:2:6", "try() should have a new item in the stack trace (sourcefile:lineno:column)")
  }

  try {
    postcss.process("\nthis{throws:error(alert!)}")
    t.fail("should throw an error with adjusted stack")
  }
  catch (e) {
    var stack = e.stack.split("\n")
    t.equal(stack[0], "Error: <css input>:2:6: error detected: error(alert!)", "try() should have an explicit message (<css input>:lineno:column: message)")
    t.equal(stack[1], "    at <css input>:2:6", "try() should have a new item in the stack trace (<css input>:lineno:column)")
  }

  t.equal(postcss.process("say{hello:people}").css, "say{hello:world}", "try() should return the value of the callback if nothing happen")

  t.end()
})
