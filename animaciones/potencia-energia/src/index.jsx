import React from 'react';
import {YoungDobleRendija} from './young-doble-rendija.jsx';
import {RayleighSecuencia} from './rayleigh-secuencia.jsx';
import {Composition, registerRoot, useCurrentFrame, AbsoluteFill} from 'remotion';
import {renderSVG,renderInfographic} from './scene.mjs';
import {OndasMecanicas} from './ondas.jsx';
import {OndaTransversal,MagnitudesOnda,EtiquetasOnda,SonidoLongitudinal,ReflexionOnda,RefraccionOnda,DifraccionOnda,InterferenciaConstructiva,InterferenciaDestructiva} from './ondas-secciones.jsx';
import {PrismaDispersion,ReflexionRefraccionLuz,AnguloCriticoLuz,PolaroidRealista} from './luz-secciones.jsx';
import {PolarizacionFiltros} from './polarizacion-filtros.jsx';
import {RayleighDispersion} from './rayleigh-dispersion.jsx';

function PotenciaEnergia({format = 'wide'}) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{backgroundColor:'#f6f2e8'}}>
    <div style={{width:'100%',height:'100%'}} dangerouslySetInnerHTML={{__html: renderSVG(frame,format)}}/>
  </AbsoluteFill>;
}
function Root() {
  return <>
    <Composition id="YoungDobleRendija" component={YoungDobleRendija} durationInFrames={480} fps={30} width={1920} height={1080}/>
    <Composition id="RayleighSecuencia" component={RayleighSecuencia} durationInFrames={420} fps={30} width={1920} height={1080}/>
    <Composition id="InfografiaPotenciaEnergia" component={Infografia} durationInFrames={600} fps={30} width={1920} height={1080}/>
    <Composition id="PotenciaEnergiaCircuito" component={PotenciaEnergia} durationInFrames={2160} fps={30} width={1920} height={1080} defaultProps={{format:'wide'}}/>
    <Composition id="PotenciaEnergiaVertical" component={PotenciaEnergia} durationInFrames={2160} fps={30} width={1080} height={1920} defaultProps={{format:'vertical'}}/>
    <Composition id="OndasMecanicas" component={OndasMecanicas} durationInFrames={720} fps={30} width={1920} height={1080}/>
    <Composition id="OndaTransversal" component={OndaTransversal} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="MagnitudesOnda" component={MagnitudesOnda} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="EtiquetasOnda" component={EtiquetasOnda} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="SonidoLongitudinal" component={SonidoLongitudinal} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="ReflexionOnda" component={ReflexionOnda} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="RefraccionOnda" component={RefraccionOnda} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="DifraccionOnda" component={DifraccionOnda} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="InterferenciaConstructiva" component={InterferenciaConstructiva} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="InterferenciaDestructiva" component={InterferenciaDestructiva} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="PrismaDispersion" component={PrismaDispersion} durationInFrames={420} fps={30} width={1920} height={1080}/>
    <Composition id="ReflexionRefraccionLuz" component={ReflexionRefraccionLuz} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="AnguloCriticoLuz" component={AnguloCriticoLuz} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="PolarizacionFiltros" component={PolarizacionFiltros} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="PolaroidRealista" component={PolaroidRealista} durationInFrames={240} fps={30} width={1920} height={1080}/>
    <Composition id="RayleighDispersion" component={RayleighDispersion} durationInFrames={240} fps={30} width={1500} height={2100}/>
  </>;
}
function Infografia() {
  const frame=useCurrentFrame();
  return <AbsoluteFill><div dangerouslySetInnerHTML={{__html:renderInfographic(frame)}}/></AbsoluteFill>;
}
registerRoot(Root);
