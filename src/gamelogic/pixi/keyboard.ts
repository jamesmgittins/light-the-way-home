export const KeysPressed = {
    scrollSpeed:200,
    w:false,
    a:false,
    s:false,
    d:false,
    shift:false
}


window.onkeydown = function (e) {
	switch (e.keyCode) {
    case 16:
    case 17:
      KeysPressed.shift = true;
      break;
    case 87:
    case 38:
      KeysPressed.w = true;
      break;
    case 65:
    case 37:
      KeysPressed.a = true;
      break;
    case 83:
    case 40:
      KeysPressed.s = true;
      break;
    case 68:
    case 39:
      KeysPressed.d = true;
      break;
    default:
      return true;
	}
	return false;
};
window.onkeyup = function (e) {
	switch (e.keyCode) {
    case 16:
    case 17:
      KeysPressed.shift = false;
      break;
		case 87:
    case 38:
      KeysPressed.w = false;
			break;
		case 65:
    case 37:
      KeysPressed.a = false;
			break;
		case 83:
    case 40:
      KeysPressed.s = false;
			break;
		case 68:
    case 39:
      KeysPressed.d = false;
			break;
		default:
			return true;
	}
	return false;
};
