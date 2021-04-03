const error = document.createElement('div');
const styles = [];
styles.push('font-family: sans-serif');
styles.push('padding: 2rem 2rem');
styles.push('text-align: center');
styles.push('background: #fff');
styles.push('color: #000');
styles.push('width: 80%');
styles.push('margin: 20px auto');
styles.push('border-radius: 20px');
styles.push('font-size: 20px');
error.innerHTML = `<div style="${styles.join('; ')}">Strona "${path}" nie istnieje!</div>`;

document.body.append(error);
