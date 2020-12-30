import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as acm from '@aws-cdk/aws-certificatemanager';

export class EdgeRedirectorStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // this.createDistribution('hannahsmithson.org', 'hannahsmithsonOrg.handler');
    this.createDistribution('floehopper.org', 'floehopperOrg', 'arn:aws:acm:us-east-1:687105911108:certificate/9f1d191d-aa36-4dac-85f2-f60684a62b65');
    this.createDistribution('blog.floehopper.org', 'blogFloehopperOrg', 'arn:aws:acm:us-east-1:687105911108:certificate/aa11ee5a-54db-4a04-8307-f77330f86cb5');
  }

  createDistribution(domain: string, handler: string, certificateArn: string) {
    const certificate = acm.Certificate.fromCertificateArn(this, `${handler}Certificate`, certificateArn);
    new cloudfront.Distribution(this, `${handler}Distribution`, {
      defaultBehavior: {
        origin: new origins.HttpOrigin('example.com'),
        edgeLambdas: [
          {
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
            functionVersion: this.redirectVersion(domain, handler)
          }
        ]
      },
      domainNames: [domain],
      certificate: certificate,
      enableLogging: true
    });
  }

  redirectVersion(domain: string, handler: string) : lambda.IVersion {
    const redirectFunction = new cloudfront.experimental.EdgeFunction(this, `${handler}Redirect`, {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: `${handler}.handler`,
      code: lambda.Code.fromAsset('./lambdaFunctions/redirect')
    });

    return redirectFunction.currentVersion;
  }
}
