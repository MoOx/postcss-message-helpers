var test = require("tape")
var PostCSS = require("postcss")
var messageHelpers = require("..")

var postcss = PostCSS()
  .use(function(styles) {
    styles.eachDecl(function transformDecl(decl) {
      messageHelpers.try(function IwillThrow() {
        if (decl.value.indexOf("error(") > -1) {
          throw new Error("error detected: " + decl.value)
        }
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
    t.equal(stack[0], "Error: " + process.cwd() + "/file.css:2:6: error detected: error(alert!)", "should have an explicit message (sourcefile:lineno:column: message)")
    t.equal(stack[1], "    at " + process.cwd() + "/file.css:2:6", "should have a new item in the stack trace (sourcefile:lineno:column)")
  }

  try {
    postcss.process("\nthis{throws:error(alert!)}")
    t.fail("should throw an error with adjusted stack")
  }
  catch (e) {
    var stack = e.stack.split("\n")
    t.equal(stack[0], "Error: <css input>:2:6: error detected: error(alert!)", "should have an explicit message (<css input>:lineno:column: message)")
    t.equal(stack[1], "    at <css input>:2:6", "should have a new item in the stack trace (<css input>:lineno:column)")
  }

  t.end()
})
