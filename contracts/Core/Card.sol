pragma solidity 0.4.24;

import "./ERC721X/ERC721XToken.sol";

// Example

contract Card is ERC721XToken {

    struct Token{
      string owner;
      string tokenType;
      string tokenName;
      string image;
    }

    mapping(uint256 => Token) tokenMetaData;

    function name() external view returns (string) {
        return "Card";
    }

    function symbol() external view returns (string) {
        return "CRD";
    }

    function getTokenMeta(uint256 _tokenId) public view returns (string owner, string tokenType, string tokenName, string image) {
      return (
        tokenMetaData[_tokenId].owner,
        tokenMetaData[_tokenId].tokenType,
        tokenMetaData[_tokenId].tokenName,
        tokenMetaData[_tokenId].image
      );
    }

    // fungible mint
    function mint(uint256 _tokenId, address _to, uint256 _supply) external {
        _mint(_tokenId, _to, _supply);
    }

    // nft mint
    function mint(uint256 _tokenId, address _to, string owner, string tokenType, string tokenName, string image) external {

        _mint(_tokenId, _to);

        Token memory _newToken = Token({
            owner: owner,
            tokenType: tokenType,
            tokenName: tokenName,
            image: image
        });

        tokenMetaData[_tokenId] = _newToken;
    }
}
