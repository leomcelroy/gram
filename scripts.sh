DEV_CONTENT=$(cat <<-END
export { drawTurtle } from "/gram-js/src/drawTurtle.js";
export { Turtle } from "/gram-js/src/Turtle.js";
export { group } from "/gram-js/src/group.js";
END
)

DEV_INDEX=$(cat <<-END
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="styles.css">
    <title>drawing</title>
    <!-- CodeMirror Import -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/codemirror.min.css"></link>
    <link rel="stylesheet" href="https://codemirror.net/addon/hint/show-hint.css"></link>
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/theme/monokai.min.css"> -->
    <script type="text/javascript" src="./libs/codemirror/codemirror.min.js"></script>
    <script type="text/javascript" src="./libs/codemirror/simple.js"></script>
    <script type="text/javascript" src="./libs/codemirror/show-hint.js"></script>
    <script type="text/javascript" src="./libs/codemirror/searchcursor.js"></script>
    <script type="text/javascript" src="./libs/codemirror/comment.js"></script>
    <script type="text/javascript" src="./libs/codemirror/active-line.js"></script>

    <!-- analytics -->
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
    <script src="./src/index.js" type="module"></script>
  </body>
</html>
END
)

DEPLOY_CONTENT=$(cat <<-END
export { drawTurtle } from "https://leomcelroy.com/gram-js/src/drawTurtle.js";
export { Turtle } from "https://leomcelroy.com/gram-js/src/Turtle.js";
export { group } from "https://leomcelroy.com/gram-js/src/group.js";
END
)

DEPLOY_INDEX=$(cat <<-END
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="styles.css">
    <title>drawing</title>
    <!-- CodeMirror Import -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/codemirror.min.css"></link>
    <link rel="stylesheet" href="https://codemirror.net/addon/hint/show-hint.css"></link>
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.52.2/theme/monokai.min.css"> -->
    <script type="text/javascript" src="./libs/codemirror/codemirror.min.js"></script>
    <script type="text/javascript" src="./libs/codemirror/simple.js"></script>
    <script type="text/javascript" src="./libs/codemirror/show-hint.js"></script>
    <script type="text/javascript" src="./libs/codemirror/searchcursor.js"></script>
    <script type="text/javascript" src="./libs/codemirror/comment.js"></script>
    <script type="text/javascript" src="./libs/codemirror/active-line.js"></script>

    <!-- analytics -->
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
    <script src="./bundle.js" type="module"></script>
  </body>
</html>
END
)




if [ $1 == "run" ]; then
  deno run --allow-net --allow-read server.js
elif [ $1 == "bundle" ]; then
  # echo "Bundle it."
  # esbuild ./src/index.js --bundle --target=chrome58,firefox57,safari11,edge16 --outfile=bundle.js
  # rollup  ./src/index.js --file ./bundle.js --format module

  # to bundle
  # switch index script to bundle
  # change imports from local to website in gram_js.js

  deno cache --reload ./src/index.js
  deno bundle ./src/index.js bundle.js

  # rollup  bundle.js --file bundle2.js --format module

  # terser ./bundle.js --compress --mangle --output ./bundle.js
elif [ $1 == "deploy" ]; then
  echo "$DEPLOY_CONTENT" > ./myLibs/gram_js.js
  echo "$DEPLOY_INDEX" > ./index.html
  bash scripts.sh bundle
elif [ $1 == "dev" ]; then
  echo "$DEV_CONTENT" > ./myLibs/gram_js.js
  echo "$DEV_INDEX" > ./index.html
else
  echo "Command not recognized."
fi

