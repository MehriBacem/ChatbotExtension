import { wrap } from "lambda-wrapper";
import { Handler } from "aws-lambda";

export default function wrapper(localLambda: Handler) {
    return wrap({ handler: localLambda });
}
