<?php

/**
 * App
 * 
 */
Class App {
  //--------------------------------------------
  public $default = 'fish';
  public $path = 'fish';
  //--------------------------------------------
  public $paths = [
    'fish' => 'Ocean',
    'space' => 'Space Fight',
    'terrain' => 'Terrain Generator',
  ];
  //--------------------------------------------
  /**
   * __construct
   */
  function __construct() {
    $this->path = $_GET['path'] ?? $default;
    $this->path = str_replace(['.',' ','/'], '', $this->path);

    if (file_exists(__DIR__ . "/src/{$this->path}.js") == false) {
      $this->path = '404';
    }

    $this->title = $this->paths[$this->path] ?? $this->path;
    $this->file = $this->path;
  }
  //--------------------------------------------
  /**
   * getVariants
   */
  function getVariants()
  {
    $variants = [];

    $files = glob(__DIR__ . "/src/*.js");

    foreach ($files as $file) {
      $variants[] = basename($file, '.js');
    }

    return $variants;
  }
  //--------------------------------------------
  /**
   * renderVariantsMenu
   */
  function renderVariantsMenu()
  {
    $variants = $this->getVariants();

    foreach ($variants as $variant) {
      $class = $this->path == $variant ? 'active' : '';
      echo "<a href=\"/{$variant}\" class=\"{$class}\">{$variant}</a>", PHP_EOL;
    }

  }
  //--------------------------------------------
}


$app = new App();
