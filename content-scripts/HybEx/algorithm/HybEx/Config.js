HybEx.HybEx.Config =
{
	// Complete subdigraph
	acceptableCGSize : 1,
	objectiveCGSize : 3,
	thresholdVotes : 2,
	allowKeypage : false,
	notDuplicatedWebpages: false,		//Tiene sentido para eliminar las páginas con parámetros distintos dependiendo del mismo fichero
	largeChildren: 200,
	
	// DOM nodes map
	classNamePonderation : 0.1,			//80
	positionPonderation : 0.4,			//10
	attributesPonderation : 0.0,		//00
	descendantsPonderation : 0.5,		//10

	notClassesProbability : 1,		//0.99
	notAttributesProbability : 0.75,	//0.75
	notChildrenProbability : 1,

	option : 4,
	activatePosition : false,
	recalculatePosition : false,
	positionRestrictive : false,
	similarityThreshold : 0.9,
	
	//Activar selección de páginas mediante el menú
	menuDetection : false,
	
	rootThreshold : 0.7,
	menuThreshold: 0.8,
	
	amplitudeProb: 0.2,
	linkProb: 0.1,
	textProb: 0.3,
	ulProb: 0.2,
	representativeProb: 0.1,
	positionProb: 0.1,
	
	//ConEx clusterSize
	clusterSize: 3
};

switch (HybEx.HybEx.Config.option)
{
	case 1:
		HybEx.HybEx.Config.activatePosition = true;
		HybEx.HybEx.Config.positionRestrictive = true;
		break;
	case 2:
		HybEx.HybEx.Config.activatePosition = true;
		HybEx.HybEx.Config.positionRestrictive = false;
		break;
	case 3:
		HybEx.HybEx.Config.activatePosition = false;
		HybEx.HybEx.Config.recalculatePosition = true;
		break;
	case 4:
		HybEx.HybEx.Config.activatePosition = false;
		HybEx.HybEx.Config.recalculatePosition = false;
		break;
	default:
		HybEx.HybEx.Config.activatePosition = true;
		HybEx.HybEx.Config.positionRestrictive = true;
		break;
}

