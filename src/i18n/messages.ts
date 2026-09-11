import type { ControlGroupId } from "../models/control-group";

/** pt-BR copy. Every user-facing string lives here. */
export class Messages {
  static readonly appTitle = "UGREEN Cam";
  static readonly cameraPickerLabel = "Câmera";
  static readonly refreshCameras = "Atualizar";
  static readonly mirrorPreview = "Espelhar";
  static readonly resetAll = "Restaurar padrão";
  static readonly resetControl = "Voltar ao padrão";
  static readonly dismiss = "Fechar";
  static readonly controlsTitle = "Ajustes";

  static readonly noCameras =
    "Nenhuma câmera UVC encontrada. Conecte a câmera e toque em Atualizar.";
  static readonly loadingControls = "Lendo controles da câmera…";
  static readonly previewStarting = "Abrindo vídeo…";
  static readonly previewNotFound = "Vídeo desta câmera não encontrado no sistema.";
  static readonly previewDenied =
    "Sem acesso à câmera. Libere em Ajustes do Sistema › Privacidade e Segurança › Câmera.";

  static readonly listFailed = "Falha ao listar câmeras";
  static readonly openFailed = "Falha ao abrir a câmera";
  static readonly writeFailed = "Falha ao aplicar ajuste";
  static readonly resetFailed = "Falha ao restaurar padrões";
  static readonly presetsFailed = "Falha nos presets";

  static readonly presetsTitle = "Presets";
  static readonly presetNamePlaceholder = "Nome do preset";
  static readonly savePreset = "Salvar";
  static readonly applyPreset = "Aplicar";
  static readonly deletePreset = "Excluir preset";
  static readonly startupPresetToggle = "Aplicar ao conectar a câmera";
  static readonly startupPresetCaption = "Aplicado ao conectar";
  static readonly noPresets = "Nenhum preset salvo. Ajuste a imagem e salve com um nome.";

  static readonly groupTitles: Record<ControlGroupId, string> = {
    image: "Imagem",
    color: "Cor",
    exposure: "Exposição",
    optics: "Foco e enquadramento",
  };

  static readonly controlLabels: Record<string, string> = {
    brightness: "Brilho",
    contrast: "Contraste",
    hueAuto: "Matiz automático",
    hue: "Matiz",
    saturation: "Saturação",
    sharpness: "Nitidez",
    gamma: "Gama",
    backlightCompensation: "Compensação de contraluz",
    whiteBalanceAuto: "Balanço de branco automático",
    whiteBalanceTemperature: "Temperatura de cor",
    autoExposureMode: "Modo de exposição",
    exposureTime: "Tempo de exposição",
    gain: "Ganho",
    powerLineFrequency: "Anti-flicker",
    focusAuto: "Foco automático",
    focus: "Foco",
    zoom: "Zoom",
    pan: "Horizontal",
    tilt: "Vertical",
    roll: "Rotação",
  };

  static readonly menuOptionLabels: Record<string, Record<number, string>> = {
    autoExposureMode: {
      1: "Manual",
      2: "Automático total",
      4: "Prioridade obturador",
      8: "Automático",
    },
    powerLineFrequency: {
      0: "Desligado",
      1: "50 Hz",
      2: "60 Hz",
      3: "Auto",
    },
  };

  static readonly units = {
    milliseconds: "ms",
    kelvin: "K",
  };
}
