pragma solidity 0.5.10;


contract MockUniswapFactory {
    constructor() public {}

    address public exchangeTemplate;
    uint256 public tokenCount;
    mapping(uint256 => address) public idToToken;
    mapping(address => address) public exchanges;
    mapping(address => address) public tokens;
    address public _exchange;

    // Create Exchange
    function createExchange(address token)
        external
        pure
        returns (address exchange)
    {
        return token; // return random address.
    }

    // Get Exchange and Token Info
    function getExchange(address token)
        external
        view
        returns (address exchange)
    {
        return exchanges[token];
    }

    function getToken(address exchange) external view returns (address token) {
        return tokens[exchange];
    }

    function getTokenWithId(uint256 tokenId)
        external
        view
        returns (address token)
    {
        return idToToken[tokenId];
    }

    function setTokenExchange(address token, address exchange) external {
        exchanges[token] = exchange;
        tokens[exchange] = token;
    }

    function setTokenWithId(uint256 tokenId, address token) external {
        idToToken[tokenId] = token;
    }
}
