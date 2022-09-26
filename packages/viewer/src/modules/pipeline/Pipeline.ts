import { Camera, Scene, WebGLRenderer } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SAOPass, SAOPassParams } from 'three/examples/jsm/postprocessing/SAOPass.js'
import Batcher from '../batching/Batcher'
import { ApplySAOPass } from './ApplySAOPass'
import { SpeckleSAOPass } from './SpeckleSAOPass'

export interface PipelineOptions {
  saoEnabled?: boolean
  saoParams?: Partial<SAOPassParams>
  saoScaleOffset?: number
}

export const DefaultPipelineOptions: PipelineOptions = {
  saoEnabled: true,
  saoParams: {
    saoBias: 0,
    saoIntensity: 1.25,
    saoScale: 434,
    saoKernelRadius: 10,
    saoMinResolution: 0,
    saoBlur: true,
    saoBlurRadius: 4,
    saoBlurStdDev: 4,
    saoBlurDepthCutoff: 0.0007
  },
  saoScaleOffset: 0
}

export class Pipeline {
  private _renderer: WebGLRenderer = null
  private _batcher: Batcher = null
  private _pipelineOptions: PipelineOptions = {}
  private composer: EffectComposer = null
  private renderPass: RenderPass = null
  private saoPass: SAOPass = null
  private applySaoPass: ApplySAOPass = null

  public set pipelineOptions(options: PipelineOptions) {
    Object.assign(this._pipelineOptions, options)
    if (this.saoPass) {
      this.applySaoPass.enabled = this._pipelineOptions.saoEnabled
      Object.assign(this.saoPass.params, this._pipelineOptions.saoParams)
      this.saoPass.params.saoScale += this._pipelineOptions.saoScaleOffset
    }
  }

  public constructor(renderer: WebGLRenderer, batcher: Batcher) {
    this._renderer = renderer
    this._batcher = batcher
    this.composer = new EffectComposer(renderer)
    this.composer.readBuffer = null
    this.composer.writeBuffer = null
  }

  public configure(scene: Scene, camera: Camera) {
    this.saoPass = new SpeckleSAOPass(scene, camera, this._batcher, false, true)
    this.composer.addPass(this.saoPass)
    this.renderPass = new RenderPass(scene, camera)
    this.renderPass.renderToScreen = true
    this.composer.addPass(this.renderPass)
    this.applySaoPass = new ApplySAOPass(this.saoPass.saoRenderTarget.texture)
    this.applySaoPass.renderToScreen = true
    this.composer.addPass(this.applySaoPass)
  }

  public render(scene: Scene, camera: Camera) {
    this.renderPass.scene = scene
    this.renderPass.camera = camera
    this.saoPass.scene = scene
    this.saoPass.camera = camera
    this.composer.render()
  }
}
