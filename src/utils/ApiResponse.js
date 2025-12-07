// When ever we send response from server we will use this ApiResponse class to maintain uniformity in response structure

class ApiResponse{
constructor(statusCode,message="Sucess")
{
  this.statusCode=statusCode<400 // Bccoz API RESPONSE WITH STATUS CODE LESS THAN 400 ARE CONSIDERED SUCCESSFUL
  this.message=message
  this.success=true
}

}
export {ApiResponse}