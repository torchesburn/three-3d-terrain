<?php
  include_once __DIR__ . '/app.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" type="text/css" href="./css/style.css">
  <script src="./src/modules/three.module.js" type="module"></script>
  <title>3D | <?=$app->title?> | <?=$app->file?></title>
</head>
<body>
  <div id="target"></div>
  <script>const path = <?=json_encode($_GET['path'])?>;</script>
  <script src="./src/<?=$app->file?>.js" type="module"></script>

  <div class="menu">
    <a href="/">HOME</a>
    <?=$app->renderVariantsMenu()?>
  </div>
  <div id="error"></div>
</body>
</html>